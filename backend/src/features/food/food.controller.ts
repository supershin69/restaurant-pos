import type { Request, Response } from "express";
import { foodService } from "./food.service.ts";

class FoodController {
    async uploadFood(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "An image file is required." });
            }

            const result = await foodService.createFood(req.body, req.file);

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
}

export const foodController = new FoodController();