import { Server, Socket } from "socket.io";

export const registerOrderHandlers = (io: Server, socket: Socket) => {
    socket.on("order:force_refresh_request", () => {
        console.log('Cient requested a manual refresh.');

        io.emit("orders_mutated", { action: "MANUAL_REFRESH" });
    });
}