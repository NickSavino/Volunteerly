import "dotenv/config"

import z from "zod";

const envSchema = z.object({
    PORT: z.coerce.number(),
    CORS_ORIGIN: z.string(),
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string()
})

export const env = envSchema.parse(process.env);