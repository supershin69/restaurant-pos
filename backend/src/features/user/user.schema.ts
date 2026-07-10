import z from "zod";

export const updateUserSchema = z.object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email format").optional()
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;