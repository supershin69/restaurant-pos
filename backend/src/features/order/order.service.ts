import NodeCache from "node-cache";
import type { CreateOrderInput, UpdateOrderInput } from "./order.schema.ts";
import prisma from "../../db/connect_db.ts";

const orderCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class OrderService {
    async createOrder(cashierId: string, input: CreateOrderInput) {
        const { tableId, items } = input;
        const foodIds = items.map((i) => i.foodId);
        const foods = await prisma.food.findMany({
            where: {
                id: {
                    in: foodIds
                },
                isDeleted: false
            },
        });

        if (foods.length != items.length) {
            throw new Error("One or more food items were not found or are inactive.");
        }

        const foodMap = new Map(foods.map(f => [f.id, f]));

        let calculatedTotalPrice = 0;

        const orderItemsData = items.map((item) => {
            const food = foodMap.get(item.foodId);
            const priceAtOrder = food!.price;
            calculatedTotalPrice += priceAtOrder * item.quantity;

            return {
                foodId: item.foodId,
                quantity: item.quantity,
                status: "PLACED" as const,
                priceAtOrder,
            };
        });

        const newOrder = await prisma.$transaction(async (tx) => {
            return await tx.order.create({
                data: {
                    cashierId,
                    tableId,
                    totalPrice: calculatedTotalPrice,
                    items: {
                        createMany: {
                            data: orderItemsData
                        }
                    }
                },
                include: {
                    table: true,
                    cashier: { select: {
                        id: true,
                        name: true,
                        role: true
                    }},
                    items: {
                        include: {
                            food: {
                                select: {
                                    name: true,
                                    photoUrl: true
                                }
                            }
                        }
                    }
                }
            });
        });

        return newOrder;


    }

    async viewOrders(page: number, limit: number, search?: string, userId?: string, tableId?: string, isDeleted: boolean = false, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc' ) {
        const skip = (page - 1) * limit;
        const cacheKey = `orders:page:${page}:limit:${limit}:search:${search || ''}:userId:${userId}:tableId:${tableId}:isDeleted:${isDeleted}:sortBy:${sortBy}:sortOrder:${sortOrder}`;

        const cachedData = orderCache.get(cacheKey);
        if (cachedData) {
            return { data: cachedData, fromCache: true }
        }

        const whereClause: any = { isDeleted }
        whereClause.AND = [
            search ? { id: { contains: search, mode: 'insensitive' }} : {},
            userId ? { cashierId: userId } : {},
            tableId ? { tableId } : {}
        ];

        const [ orders, totalCount ] = await prisma.$transaction([
            prisma.order.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.order.count({ where: whereClause })
        ]);

        const result = {
            orders: orders,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount/limit),
                currentPage: page,
                limit
            }
        }

        orderCache.set(cacheKey, result);

        return { data: result, fromCache: false }
    }

    async updateOrder(actorId: string, orderId: string, input: UpdateOrderInput) {
        const { items } = input;
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!existingOrder || existingOrder.isDeleted) {
            throw new Error("Order not found or has been deleted");
        }

        const foodIds = items.map((i) => i.foodId);
        const foods = await prisma.food.findMany({
            where: {id: {
                in: foodIds
            }, isDeleted: false }
        });

        if (foods.length !== items.length) {
            throw new Error("One or more food items were not found or are inactive.");
        }

        const foodMap = new Map(foods.map((f) => [f.id, f]));

        const activeItems = existingOrder.items.filter((item) => item.status === "PLACED");
        const activeItemMap = new Map(activeItems.map((i) => [i.foodId, i]));

        const incomingFoodIds = new Set(items.map((i) => i.foodId));
        const itemIdsToCancel: string[] = [];
        const itemsToCreate: { foodId: string; quantity: number; priceAtOrder: number; status: "PLACED" }[] = [];

        for (const activeItem of activeItems) {
            if (!incomingFoodIds.has(activeItem.foodId)) {
                itemIdsToCancel.push(activeItem.id);
            }
        }

        for (const item of items) {
            const existingActive = activeItemMap.get(item.foodId);
            const food = foodMap.get(item.foodId);

            if (existingActive) {
                if (existingActive.quantity === item.quantity) {
                    continue;
                } else {
                    itemIdsToCancel.push(existingActive.id);
                    itemsToCreate.push({
                        foodId: item.foodId,
                        quantity: item.quantity,
                        priceAtOrder: food!.price,
                        status: "PLACED" as const
                    });
                }
            } else {
                itemsToCreate.push({
                    foodId: item.foodId,
                    quantity: item.quantity,
                    priceAtOrder: food!.price,
                    status: "PLACED"
                });
            }
        }

        let updatedTotalPrice = 0;

        for (const activeItem of activeItems) {
            if (!itemIdsToCancel.includes(activeItem.id)) {
                updatedTotalPrice += activeItem.priceAtOrder * activeItem.quantity;
            }
        }

        for (const newItem of itemsToCreate) {
            updatedTotalPrice += newItem.priceAtOrder * newItem.quantity;
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            if (itemIdsToCancel.length > 0) {
                await tx.orderItem.updateMany({
                    where: { id: { in: itemIdsToCancel } },
                    data: { status: "CANCELLED" }
                });
            }

            if (itemsToCreate.length > 0) {
                await tx.orderItem.createMany({
                    data: itemsToCreate.map((item) => ({
                        orderId,
                        foodId: item.foodId,
                        quantity: item.quantity,
                        priceAtOrder: item.priceAtOrder,
                        status: item.status
                    }))
                });
            }

            return await tx.order.update({
                where: { id: orderId },
                data: {
                    totalPrice: updatedTotalPrice
                },
                include: {
                    table: true,
                    cashier: {
                        select: { id: true, name: true, role: true }
                    },
                    items: {
                        include: {
                            food: {
                                select: { name: true, photoUrl: true }
                            },
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            })
        });

        return updatedOrder;

        
    }

    async viewOrderDetail(orderId: string) {
        const result = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                table: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                cashier: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        status: true,
                        priceAtOrder: true,
                        food: {
                            select: {
                                id: true,
                                name: true,
                                photoUrl: true
                            }
                        },
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        return result;
    }

    async deleteOrders(actorId: string, ids: string[]) {
        return await prisma.$transaction(async (tx) => {
            const deletedOrders = await tx.order.updateMany({
                where: {
                    id: {
                        in: ids
                    },
                    isDeleted: false
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            return deletedOrders;
        });
        
    }

    async restoreOrders(actorId: string, ids: string[]) {
        return await prisma.$transaction(async (tx) => {
            const restoredOrders = await tx.order.updateMany({
                    where: {
                        id: {
                            in: ids
                        },
                        isDeleted: true
                    },
                    data: {
                        isDeleted: false,
                        deletedAt: null
                    }
                });

                return restoredOrders;
            });
    }

    clearOrderCache() {
        const keys = orderCache.keys();
        const orderKeys = keys.filter(key => key.startsWith('orders:'));
        if (orderKeys.length > 0) {
            orderCache.del(orderKeys);
        }
    };



}

export const orderService = new OrderService();