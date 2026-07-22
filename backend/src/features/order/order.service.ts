import NodeCache from "node-cache";
import type { CreateOrderInput } from "./order.schema.ts";
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
            userId ? { userId } : {},
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
                        priceAtOrder: true,
                        food: {
                            select: {
                                id: true,
                                name: true,
                                photoUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!result) {
            throw new Error("Order not found");
        }

        return result;
    }

    async deleteOrders(ids: string[]) {
        const deletedOrders = await prisma.order.updateMany({
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
    }

    async restoreOrders(ids: string[]) {
        const restoredOrders = await prisma.order.updateMany({
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
    }



}

export const orderService = new OrderService();