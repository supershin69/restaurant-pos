import { configDotenv } from "dotenv";
import { type Express, type Request, type Response } from "express";
import express from "express";
import cors from "cors";
import prisma from "./db/connect_db.ts";

configDotenv();

const app: Express = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    return res.json({
        message: "Hello World"
    });
});

async function startServer() {
    try {
        // Don't change this. I need it to make sure database connects whenever I start the server.
        await prisma.$connect();
        console.log("Successfully Connected to Supabase PostgreSQL Database");

        // This is the actual server start code
        app.listen(PORT, () => console.log(`The service is running at port ${PORT}. Press Ctrl + C or Cmd + C to stop the server.`));
    } catch (error) {
        console.error("Failed to connect to the database.", error);

        // Just stop the server lol
        await prisma.$disconnect();
        process.exit(1);
    }
}

startServer();

