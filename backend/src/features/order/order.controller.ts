import type { Request, Response } from "express";
import { orderService } from "./order.service.ts";
import type { AuthRequest } from "../../middlewares/auth.middleware.ts";
import type { Server } from "socket.io";

const allowedFields = [
    'createdAt',
    'updatedAt',
    'name',
    'totalPrice'
];

class OrderController {
    async fetchOrders(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const userId = req.query.userId ? String(req.query.userId) : undefined;
            const tableId = req.query.tableId ? String(req.query.tableId) : undefined;
            const isDeleted = String(req.query.isDeleted).toLowerCase() === 'true';
            const sortBy = allowedFields.includes(String(req.query.sortBy)) ? String(req.query.sortBy) : 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

            const { data, fromCache } = await orderService.viewOrders(page, limit, search, userId, tableId, isDeleted, sortBy, sortOrder);

            res.setHeader("X-Cache-Lookup", fromCache ? "HIT" : "MISS");

            return res.status(200).json({ status: "success", message: "Orders fetched successfully", ...data});
        } catch (error: any) {
            console.error("[GET ORDERS ERROR]: ", error)
             return res.status(500).json({ error: 'Failed to fetch orders.' });
        }
        
    }

    async createOrder(req: AuthRequest, res: Response) {
        try {
            const cashierId = req.user?.userId;
            if (!cashierId) {
                return res.status(401).json({ message: "Unauthorized to create order. Plaease log in." });
            }
            const orderInput = req.body;
            const result = await orderService.createOrder(cashierId, orderInput);

            orderService.clearOrderCache();

            const io: Server = req.app.get("io");
                        io.emit("orders_mutated", { 
                            action: "CREATE", 
                            message: "A new order was added" 
                        });

            return res.status(201).json({
                status: "success",
                message: "Order created successfully",
                data: result
            });

        } catch (error: any) {
            console.error('[Create Order Error]:', error);
            res.status(500).json({ error: 'An unexpected error occurred while creating the Order.' });
        }
    }

    async updateOrder(req: AuthRequest, res: Response) {
        try {
            const actorId = req.user?.userId;
            if (!actorId) {
                return res.status(401).json(
                    { message: "Unauthorized. Please log in." }
                );
            }
            const orderId = req.params.id;
            const orderInput = req.body;

            const result = await orderService.updateOrder(actorId, orderId, orderInput);

            orderService.clearOrderCache();

            const io: Server = req.app.get("io");
            io.emit("orders_mutated", {
                action: "UPDATE",
                message: "An order was updated"
            });

            return res.status(200).json({
                status: "success",
                message: "Order updated successfully",
                data: result
            });


        } catch (error: any) {
            console.error("[Update Order Error]:", error);
            return res.status(500).json({
                error: "An unexpected error occurred while updating the order."
            });
        }
    }

    async viewOrderDetail(req: Request, res: Response) {
        try {
            const orderId = req.params.id;
            const result = await orderService.viewOrderDetail(orderId);

            if (!result) {
                return res.status(404).json({
                    status: "fail",
                    message: "Order not found"
                });
            }

            return res.status(200).json({ status: "success", message: "Fetched order detail successfully.", order: result });
        } catch (error: any) {
            console.error("GET ORDER DETAIL ORDER: ", error);
            return res.status(500).json({ error: "There is an error while fetching order detail"});
        }
    }

    async deleteOrders(req: AuthRequest, res: Response) {
        try {
            const { ids } = req.body;
            const actorId = req.user!.userId;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ error: "Order ids are required" });
            }
            const result = await orderService.deleteOrders(actorId, ids);
            orderService.clearOrderCache();
            
            const io: Server = req.app.get("io");
            io.emit("orders_mutated", {
                action: "DELETE",
                message: `${result.count} orders were deleted`
            });

            return res.status(200).json({
                status: "success",
                message: `${result.count} orders deleted successfully.`,
                data: result
            });

        } catch (error: any) {
            console.error("[Soft Delete Error]:", error);

            return res.status(500).json({
                error: "Failed to soft delete orders."
            });
        }
    }

    async restoreOrders(req: AuthRequest, res: Response) {
        try {
            const { ids } = req.body;
            const actorId = req.user!.userId;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ error: "Order ids are required" });
            }
            const result = await orderService.restoreOrders(actorId, ids);
            orderService.clearOrderCache();
            
            const io: Server = req.app.get("io");
            io.emit("orders_mutated", {
                action: "RESTORE",
                message: `${result.count} orders were restored.`
            });

            return res.status(200).json({
                status: "success",
                message: `${result.count} orders restored successfully.`,
                data: result
            });
        } catch (error: any) {
            console.error("[Restore Error]:", error);

            return res.status(500).json({
                error: "Failed to restore orders."
            });
        }
    }
}

export const orderController = new OrderController();