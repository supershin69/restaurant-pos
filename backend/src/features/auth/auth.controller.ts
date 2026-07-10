import type { Request, Response } from "express";
import { authService } from "./auth.service.ts";
import { userService } from "../user/user.service.ts";
import type { Server } from "socket.io";

class AuthController {
    async register(req: Request, res: Response) {
        try {
            const result = await authService.registerUser(req.body);
            userService.clearUserCache();

            const io: Server = req.app.get("io");
            io.emit("users_mutated", {
                action: "CREATE",
                message: "User created successfully."
            });

            return res.status(201).json({
                status: "success",
                message: "User registered successfully",
                data: result.user
            });
        } catch (error: any) {
            if (error.message === 'Email already exists') {
                return res.status(409).json({ error: error.message });
            }
            
            // Fallback for unexpected database/server issues
            console.error('[Auth Register Error]:', error);
            res.status(500).json({ error: 'An unexpected error occurred during registration.' });
        }
    } 

    async login(req: Request, res: Response) {
        try {
            const result = await authService.loginUser(req.body);

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            token: result.token,
            data: result.user
        });
    } catch (error: any) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ error: error.message });
        }

        // Fallback for unexpected database/server issues
        console.error('[Auth Login Error]: ', error);
        res.status(500).json({ error: 'An unexpected error occurred during login.' });
    }
}
}

export const authController = new AuthController();