import type { Request, Response, NextFunction } from "express";
import z from "zod";

export const validate = (schema: z.ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
            return res.status(400).json({
            status: 'fail',
            message: 'Validation error occurred.',
            // Map errors into a clean, frontend-friendly format
            errors: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                })),
                });
            }
        }
        return res.status(500).json({ error: 'Internal server error during validation.' });
    }   
}