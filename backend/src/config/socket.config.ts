import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { registerFoodHandlers } from "../features/food/food.socket.ts";
import { registerTableHandlers } from "../features/table/table.socket.ts";

export const initSocketServer = (httpServer: HttpServer): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
            credentials: true
        },

        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        registerFoodHandlers(io, socket);
        registerTableHandlers(io, socket);

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}