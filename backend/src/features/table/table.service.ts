import NodeCache from "node-cache";
import prisma from "../../db/connect_db.ts";

const tableCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class TableService {
    async createTable(name: string) {
        const existingTable = await prisma.table.findFirst({
            where: {
                name: name
            }
        });

        if (existingTable) {
            throw new Error("Table already exists.");
        }

        const newTable = await prisma.table.create({
            data: {
                name: name
            }
        });

        return newTable;
    }

    async getTables(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const cacheKey = `tables:page:${page}:limit:${limit}`;

        const cachedData = tableCache.get(cacheKey);
        if (cachedData) {
            return { data: cachedData, fromCache: true }
        }

        const [ tables, totalCount ] = await prisma.$transaction([
            prisma.table.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.table.count()
        ]);

        const result = {
            tables,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        };

        tableCache.set(cacheKey, result);
        
        return { data: result, fromCache: false };
    }

    async deleteTables(ids: string[]) {
        const deletedTables = await prisma.table.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        return deletedTables;
    }

    clearTableCache() {
        const keys = tableCache.keys();
        const tableKeys = keys.filter(key => key.startsWith('tables:'));
        if (tableKeys.length > 0) {
            tableCache.del(tableKeys);
        }
    };
}

export const tableService = new TableService();