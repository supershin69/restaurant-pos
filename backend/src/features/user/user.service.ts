import NodeCache from "node-cache";
import prisma from "../../db/connect_db.ts";

const userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class UserService {
    
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
}

export const userService = new UserService();