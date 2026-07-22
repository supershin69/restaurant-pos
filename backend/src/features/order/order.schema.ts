import z from "zod";

export const createOrderSchema = z.object({
    tableId: z.string().uuid("Invalid Table ID"),
    items: z.array(
        z.object({
            foodId: z.string().uuid("Invalid food Id"),
            quantity: z.number().int().min(1, "Quantity must be at least 1"),
        })
    ).min(1, "Order should contain at least one item")
});

export const updateOrderSchema = z.object({
    items: z.array(
        z.object({
            foodId: z.string().uuid("Invalid food Id"),
            quantity: z.number().int().min(1, "Quantity must be at least 1")
        })
    ).min(1, "Order should contain at least one item")
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

