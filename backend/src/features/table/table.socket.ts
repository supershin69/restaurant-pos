import { Server, Socket } from 'socket.io';

export const registerTableHandlers = (io: Server, socket: Socket) => {
    socket.on("table:force_refresh_request", () => {
        console.log("Client requested a manual refresh.")

        io.emit("table_mutated", { action: "MANUAL REFRESH" });
    });
}