import NodeCache from "node-cache";
import prisma from "../../db/connect_db.ts";
import { renameFile } from "../../utils/fileRemamer.ts";
import { supabase } from "../../utils/supabase.ts";
import type { UserResponseType } from "./user.types.ts";
import type { UpdateUserInput } from "./user.schema.ts";

const userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class UserService {

    //! Fetch All Users
    async fetchUsers(
        page: number, 
        limit: number, 
        search?: string, 
        sortBy: string = 'created_at', 
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const skip = (page - 1) * limit;
        const cacheKey = `users:page:${page}:limit:${limit}:deleted:search:${search || ''}:sortBy:${sortBy}:sortOrder:${sortOrder}`;
        const cachedData = userCache.get(cacheKey);

        if (cachedData) {
            return { data: cachedData, fromCache: true }
        }

        const whereClause: any =  {}
        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive'
            }
        }

        const [ users, totalCount ] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        const result = {
            users,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount/limit),
                currentPage: page,
                limit 
            }
        }

        userCache.set(cacheKey, result);

        return { data: result, fromCache: true }
    }

    //! Fetch One Single User
    async getIndividualUser(id: string): Promise<UserResponseType> {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                name: true,
                email: true,
                role: true,
                profile: {
                    select: {
                        profilePhotoUrl: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error("User does not exist.");
        }

        return {
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profile?.profilePhotoUrl ?? null
        }
    }

    //! ChangeProilePicture
    async changeProfilePicture(id: string, file: Express.Multer.File) {
        const filename = renameFile(file.originalname);
        const filePath = `profiles/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pos-food-photo")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from("pos-food-photo")
            .getPublicUrl(filePath);
        
        const newProfilePhoto = await prisma.profile.update({
            where: { id },
            data: {
                profilePhotoUrl: publicUrlData.publicUrl
            }
        });

        return newProfilePhoto;
    }

    //! Update User Data
    async updateUserData(id: string, data: UpdateUserInput) {
        const currentUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profile: { select: { profilePhotoUrl: true } }
            }
        });

        if (!currentUser) {
            throw new Error("User does not exist");
        }

        const updatePayload: Partial<UpdateUserInput> = {}

        if (data.name && data.name !== currentUser.name) {
            updatePayload.name = data.name;
        }

        if (data.email && data.email !== currentUser.email) {
            const emailOwner = await prisma.user.findUnique({
                where: {
                    email: data.email
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                }
            });

            if (emailOwner?.id !== id) {
                throw new Error("Email already exists");
            }

            updatePayload.email = data.email;

        }

        if (Object.keys(updatePayload).length === 0) {
            return {
                success: true,
                message: "No changes detected. Database update was skipped.",
                user: currentUser
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updatePayload,
            select: { id: true, name: true, email: true, role: true, profile: { select: { profilePhotoUrl: true } } }
        });

        return {
            success: true,
            message: "User updated successfully",
            user: updatedUser
        }

    }

    //! Delete User Function
    async deleteUsers(ids: string[]) {
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return deletedUsers;
    }

    //! Clear User Cache
    clearUserCache() {
        const keys = userCache.keys();
        const userKeys = keys.filter(key => key.startsWith("users:"));
        if (userKeys.length > 0) {
            userCache.del(userKeys);
        }
    }
}

export const userService = new UserService();