import type { Request, Response } from "express";
import { foodService } from "./food.service.ts";
import type { Server } from "socket.io";

class FoodController {
    //! Food Upload Function
    async uploadFood(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "An image file is required." });
            }

            const result = await foodService.createFood(req.body, req.file);

            foodService.clearFoodCache();

            const io: Server = req.app.get("io");
            io.emit("foods_mutated", { 
                action: "CREATE", 
                message: "A new food item was added" 
            });

            return res.status(201).json({
                status: "success",
                message: "Food item created successfully",
                data: result
            });
        } catch (error: any) {
            if (error.message === 'Food already exists') {
                return res.status(409).json({ error: error.message });
            }
            console.error('[Create Food Error]:', error);
            res.status(500).json({ error: 'An unexpected error occurred while creating the food item.' });
        }
    }

    //! Food Update Function
    async updateFood(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                return res.status(400).json({ error: 'Invalid food ID provided.' });
            }
            const result = await foodService.updateFood(id, req.body, req.file);
            foodService.clearFoodCache();

            const io: Server = req.app.get("io");
            io.emit("foods_mutated", {
                action: "UPDATE",
                message: "A food item was updated"
            });

            return res.status(200).json({
                status: "success",
                message: "Food item updated successfully",
                data: result
            });
        } catch (error: any) {
            console.error('[Update Food Error]:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Food item not found.' });
            }
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    }

    //! Fetch Food Function
    async fetchAllFoods(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

            const { data, fromCache } = await foodService.getFoods(page, limit, search, sortBy, sortOrder);

            res.setHeader("X-Cache-Lookup", fromCache ? "HIT" : "MISS");

            return res.status(200).json({ status: "success", message: "food fetched successfully", ...data});
        } catch (error: any) {
            console.error('[Get Foods Error]:', error);
            return res.status(500).json({ error: 'Failed to fetch food items.' });
        }
        
    }

    //! Fetch Deleted Foods Function
    async fetchDeletedFoods(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

            const { data, fromCache } = await foodService.getDeletedFoods(page, limit, search, sortBy, sortOrder);

            res.setHeader("X-Cache-Lookup", fromCache ? "HIT" : "MISS");

            return res.status(200).json({ status: "success", message: "Deleted foods fetched successfully", ...data});
        } catch (error: any) {
            console.error('[Get Foods Error]:', error);
            return res.status(500).json({ error: 'Failed to fetch deleted food items.' });
        }
    }

    //! Soft Delete Function
    async softDeleteFood( req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                return res.status(400).json({ error: 'Invalid food ID provided.' });
            }
            const result = await foodService.softDeleteFood(id);
            foodService.clearFoodCache();

            const io: Server = req.app.get("io");
            io.emit("foods_mutated", {
                action: "DELETE",
                message: "The food was soft deleted."
            });

            return res.status(200).json({
                status: "success",
                message: "Food was soft deleted successfully",
                data: result
            });
        } catch (error: any) {
            console.error('[Soft Delete Foods Error]: ', error);
            return res.status(500).json({ error: 'Failed to soft delete food items.'});
        }
    }

    //! Bulk Soft Delete Function
    async bulkSoftDeleteFoods(req: Request, res: Response) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    error: "Food IDs are required."
                });
            }
            const result = await foodService.bulkSoftDeleteFood(ids);

            foodService.clearFoodCache();

            const io: Server = req.app.get("io");

            io.emit("foods_mutated", {
                action: "DELETE",
                message: `${result.count} food items were soft deleted.`
            });

            return res.status(200).json({
                status: "success",
                message: `${result.count} items soft deleted successfully.`,
                data: result
            });
        } catch(error: any) {
            console.error("[Bulk Soft Delete Error]:", error);

            return res.status(500).json({
                error: "Failed to soft delete food items."
            });
        }
    }

    async bulkRestoreFood(req: Request, res: Response) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    error: "Food IDs are required."
                });
            }
            const result = await foodService.restoreFood(ids);

            foodService.clearFoodCache();

            const io: Server = req.app.get("io");

            io.emit("foods_mutated", {
                action: "UPDATE",
                message: `${result.count} food items were restored`
            });

            return res.status(200).json({
                status: "success",
                message: `${result.count} items restored successfully.`,
                data: result
            });
        } catch(error: any) {
            console.error("[Bulk restore Error]:", error);

            return res.status(500).json({
                error: "Failed to restore food items."
            });
        }
    }
}

export const foodController = new FoodController();