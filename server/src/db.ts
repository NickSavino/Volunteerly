import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter });