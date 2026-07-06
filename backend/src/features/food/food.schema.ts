import { z } from "zod";

export const createFoodSchema = z.object({
    name: z.string({ error: "Name is required"}).min(2, "Name must be at least 2 characters long"),
    description: z.string().optional(),
    price: z.coerce
    .number({ error: "Price must be a valid number" })
    .positive("Price must be greater than 0")
});