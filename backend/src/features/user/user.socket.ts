import { Server, Socket } from "socket.io";

export const registerUserHandlers = (io: Server, socket: Socket) => {
    socket.on("user:manual_refresh", () => {
        console.log('Cient requested a manual refresh.');

        io.emit("users_mutated", {
            action: "MANUAL_REFRESH"
        });
    });
}