import type { Request, Response } from "express";
import { authService } from "../auth/auth.service.ts";
import { userService } from "./user.service.ts";
import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import type { AuthRequest } from "../../middlewares/auth.middleware.ts";

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';


class UserController {
    //! Create User
    async createUser(req: Request, res: Response) {
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

            //! Fetch Users
    async fetchUsers(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

            const { data: users, fromCache } = await userService.fetchUsers(page, limit, search, sortBy, sortOrder);

            res.setHeader("X-Cache-Lookup", fromCache ? "HIT" : "MISS");

            return res.status(200).json({
                status: "success",
                message: "Users fetched successfully",
                ...users
            });

        } catch(error: any) {
            console.error('[GET USER ERROR]: ', error);
            return res.status(500).json({ error: "Failed to fetch users"});
        }
    }


    //! Fetch Single User with ID
    async fetchSingleUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                return res.status(400).json({ error: 'Invalid User ID provided.' });
            }
            const user = await userService.getIndividualUser(id);

            return res.status(200).json({
                status: "success",
                message: "User fetched successfully",
                user
            });


        } catch (error: any) {
            if (error.message === "User does not exist.") {
                return res.status(400).json({ error: "User does not exists."});
            }

            console.error("[Fetch Single User Fail]: ", error);
            return res.status(500).json({ error: "Failed to fetch that user."});
        }
    }

    async fetchMyself(req: AuthRequest, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: "You are unauthenticated. Please log in."});
            }
            const id = user.userId;
            const myProfile = await userService.getMyProfile(id);

            return res.status(200).json({
                status: "success",
                message: "Your profile fetched successfully",
                user: myProfile
            });


        } catch (error: any) {
             if (error.message === "User does not exist.") {
                return res.status(400).json({ error: "User does not exist."});
            }

            console.error("[Fetch Single User Fail]: ", error);
            return res.status(500).json({ error: "Failed to fetch that user."});
        }
    }

    //! Update User
    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                return res.status(400).json({ error: "Invalid User ID provided."});
            }

            if (!req.file && !req.body.name && !req.body.email) {
                return res.status(400).json({ 
                    status: "fail", 
                    message: "At least one field (name, email, or profile picture) must be provided to update." 
                });
            }

            let newPhotoUrl = null;

            if (req.file) {
                newPhotoUrl = await userService.changeProfilePicture(id, req.file);
            }

            const newUserData = await userService.updateUserData(id, req.body);

            userService.clearUserCache();

            const io: Server = req.app.get("io");
            io.emit("users_mutated", {
                action: "UPDATE",
                message: "User updated successfully."
            });

            const profilePicture = newPhotoUrl ? newPhotoUrl.profilePhotoUrl : newUserData.user.profile?.profilePhotoUrl ?? null;

            return res.status(200).json({
                status: "success",
                message: "User updated successfully",
                data: {
                    id: newUserData.user.id,
                    name: newUserData.user.name,
                    email: newUserData.user.email,
                    role: newUserData.user.role,
                    profilePicture
                }
            });

            
        } catch (error: any) {

            if (error.message === "User does not exist") {
                return res.status(404).json({ status: 'fail', message: error.message });
            }

            if (error.message === "Email already exists") {
                return res.status(409).json({ status: 'fail', message: error.message });
            }
            
            return res.status(500).json({ status: 'error', message: error.message || "Internal server error." });
        }
    }

    //! Delete User
    async deleteUsers(req: Request, res: Response) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ error: "Please provide a valid ID"});
            }

            const deletedUsers = await userService.deleteUsers(ids);

            userService.clearUserCache();
            const io: Server = req.app.get("io");
            io.emit("users_mutated", {
                action: "DELETE",
                message: "Users successfully deleted"
            });

            return res.status(200).json({
                status: "success",
                message: `${deletedUsers.count} users deleted successfully`,
                data: deletedUsers
            });

        } catch (error: any) {
            console.error("[DELETE USER ERROR]: ", error);

            return res.status(500).json({
                error: "Failed to delete user"
            });
        }
    }
}


export const userController = new UserController();