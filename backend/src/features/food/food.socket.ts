import { Server, Socket } from 'socket.io';

export const registerFoodHandlers = (io: Server, socket: Socket) => {
    socket.on("food:force_refresh_request", () => {
        console.log('Cient requested a manual refresh.');

        io.emit("foods_mutated", { action: "MANUAL_REFRESH" });
    });
}