import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { Role } from "../../generated/prisma/enums.ts";

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

//! Extend Express Request interface so TypeScript recognizes 'req.user'
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
    };
}

//! Middleware to check if user is authenticated via httpOnly cookies or not
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("Auth middleware called.");
    const token = req.cookies?.token;
    //console.log(req.cookies);
    //console.log(req.cookies?.token);

     if (!token) {
        return res.status(401).json({
            status: 'unauthenticated',
            message: 'Access denied. Please log in to continue.',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: Role };
        req.user = decoded;
        next();

    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'unauthenticated',
                message: 'Your session has expired. Please log in again.',
            });
        }

        return res.status(401).json({
            status: 'unauthenticated',
            message: 'Invalid security token. Access denied.',
        });
    }

};

//! Middleware for RBAC check
export const restrictTo = (...allowedRoles: Role[]) => {
    console.log("Role check middleware called.")
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                status: 'forbidden',
                message: 'You do not have permission to perform this action.',
            });
        }
        next();
    };
};