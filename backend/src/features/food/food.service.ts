import prisma from "../../db/connect_db.ts";
import { renameFile } from "../../utils/fileRemamer.ts";
import { supabase } from "../../utils/supabase.ts";
import type { foodType } from "./food.types.ts";

class FoodService {
    async createFood(data: foodType, file: Express.Multer.File) {
        const fileName = renameFile(file.originalname);
        const filepath = `images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pos-food-photo")
            .upload(filepath, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from("pos-food-photo")
            .getPublicUrl(filepath);

        const newFood = await prisma.food.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                photoUrl: publicUrlData.publicUrl
            }
        });

        return newFood;
    }
}

export const foodService = new FoodService();