import type { Request, Response } from "express";
import { tableService } from "./table.service.ts";
import type { Server } from "socket.io";

class TableController {
    async createTable(req: Request, res: Response) {
        try {
            const { name } = req.body;

            const result = await tableService.createTable(name);

            tableService.clearTableCache();

            const io: Server = req.app.get("io");
            io.emit("tables_mutated", {
                action: "CREATE",
                message: "A table was created."
            });

            return res.status(201).json({
                status: "success",
                message: "Table created successfully.",
                data: result
            });
        } catch(error: any) {
            if (error.message === 'Table already exists.') {
                return res.status(409).json({ error: error.message });
            }

            console.error("Table Create Error");
            return res.status(500).json({ error: "Unexpected error occured during table creation."});
        }
    }

    async fetchTables(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const { data, fromCache } = await tableService.getTables(page, limit);

            res.setHeader("X-Cache-Lookup", fromCache ? "HIT" : "MISS");

            return res.status(200).json({ status: "success", message: "Tables fetched successfully.", ...data});

        } catch(error: any) {
            console.error('[Get Tables Error]:', error);
            return res.status(500).json({ error: 'Failed to fetch tables.' });
        }
    }

    async deleteTables(req: Request, res: Response) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    error: "Table IDs are required."
                });
            }

            const result = await tableService.deleteTables(ids);

            tableService.clearTableCache();

            const io: Server = req.app.get("io");
            io.emit("tables_mutated", {
                action: "DELETE",
                message: `${result.count} tables were deleted.`
            });

            return res.status(200).json({
                status: "success",
                message: `${result.count} tables has been deleted.`,
                data: result
            });

        } catch(error: any) {
            console.error("Table delete Error");
            return res.status(500).json({ error: "Unexpected error occured during table deletion."});
        }
    }
}

export const tableController = new TableController();