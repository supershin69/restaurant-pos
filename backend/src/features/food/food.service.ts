import prisma from "../../db/connect_db.ts";
import { renameFile } from "../../utils/fileRemamer.ts";
import { supabase } from "../../utils/supabase.ts";
import type { foodType } from "./food.types.ts";
import NodeCache from "node-cache";

const foodCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class FoodService {
    //! Food Upload Function
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

    async updateFood(id: string, data: Partial<foodType>, file?: Express.Multer.File) {
        let publicUrl: string | undefined = undefined;

        if (file) {
            const fileName = renameFile(file.originalname);
            const filePath = `images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("pos-food-photo")
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype
                });

            if (uploadError) {
                throw new Error(`Failed to upload image: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from("pos-food-photo")
                .getPublicUrl(filePath)

            publicUrl = publicUrlData.publicUrl;
        }

        const updateFood = await prisma.food.update({
            where: { id },
            data: {
                name: data.name ?? undefined,
                description: data.description ?? undefined,
                price: data.price ? data.price : undefined,
                photoUrl: publicUrl ?? undefined
            }
        });

        return updateFood;
    }

    //! Fetch Food Function
    async getAllFoods(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const cacheKey = `foods:page:${page}:limit:${limit}`;

        const cachedData = foodCache.get(cacheKey);
        if (cachedData) {
            return { data: cachedData, fromCache: true }
        }

        const [foods, totalCount] = await prisma.$transaction([
            prisma.food.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.food.count()
        ]);

        const result = {
            foods,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        };

        foodCache.set(cacheKey, result);

        return { data: result, fromCache: false }

    }

    //! Clear food cache function
    clearFoodCache() {
        const keys = foodCache.keys();
        const foodKeys = keys.filter(key => key.startsWith('foods:page:'));
        if (foodKeys.length > 0) {
            foodCache.del(foodKeys);
        }
    };
}

export const foodService = new FoodService();