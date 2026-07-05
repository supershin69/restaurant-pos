import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod/v3";
import { ZodError } from "zod/v3";

export const validate = (schema: AnyZodObject) => {
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
            return res.status(400).json({
            status: 'fail',
            message: 'Validation error occurred.',
            // Map errors into a clean, frontend-friendly format
            errors: error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                })),
                });
            }
        }
        return res.status(500).json({ error: 'Internal server error during validation.' });
    }   
}