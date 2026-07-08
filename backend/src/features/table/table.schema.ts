import { z } from 'zod';

export const createTableSchema = z.object({
    name: z.string({ error: "Name is required"}).min(2, "Name must be at least 2 characters long")
});