import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { prisma } from "./db.js";

const app = express();

console.log("DATABASE_URL runtime =", process.env.DATABASE_URL);
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
        credentials: true,
    })
);

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/health/db", async(_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, db: "connected" });
    } catch (error) {
        res.status(500).json({ ok: false, db: "error connecting", error: String(error) });
    }
})

const port = Number(process.env.PORT ?? 4000);
const server = "localhost";
app.listen(port, () => {
    console.log(`Server is listening on http://${server}:${port}`);
});