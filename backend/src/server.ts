import "dotenv/config";
import { type Express, type Request, type Response } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./db/connect_db.ts";
import { authRoutes } from "./features/auth/auth.routes.ts";
import { foodRoutes } from "./features/food/food.routes.ts";
import { requireAuth, restrictTo } from "./middlewares/auth.middleware.ts";
import { createServer } from "http";
import { initSocketServer } from "./config/socket.config.ts";
import { tableRoutes } from "./features/table/table.routes.ts";
import { userRoutes } from "./features/user/user.routes.ts";

const app: Express = express();
const httpServer = createServer(app);

const io = initSocketServer(httpServer);

app.set("io", io);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    return res.json({
        message: "Hello World"
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/food', requireAuth, restrictTo('ADMIN', 'CASHIER'), foodRoutes);
app.use('/api/table', requireAuth, restrictTo('ADMIN', 'CASHIER'), tableRoutes);
app.use('/api/users', requireAuth, restrictTo('ADMIN', 'CASHIER'), userRoutes);

async function startServer() {
    try {
        // Don't change this. I need it to make sure database connects whenever I start the server.
        await prisma.$connect();
        console.log("Successfully Connected to Supabase PostgreSQL Database");

        // This is the actual server start code
        httpServer.listen(PORT, () => console.log(`The service is running at port ${PORT}. Press Ctrl + C or Cmd + C to stop the server.`));
    } catch (error) {
        console.error("Failed to connect to the database.", error);

        // Just stop the server lol
        await prisma.$disconnect();
        process.exit(1);
    }
}

startServer();

