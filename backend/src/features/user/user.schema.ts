import z from "zod";

export const updateUserSchema = z.object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email format").optional()
}).refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one field (name or email) must be provided to update.",
    path: ["name"]
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;