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

            const { data, fromCache } = await foodService.getAllFoods(page, limit);

            res.setHeader("X-Cache-Lookup", fromCache ? "HIT" : "MISS");

            return res.status(200).json({ status: "success", message: "food fetched successfully", ...data});
        } catch (error: any) {
            console.error('[Get Foods Error]:', error);
            return res.status(500).json({ error: 'Failed to fetch food items.' });
        }
        
    }
}

export const foodController = new FoodController();