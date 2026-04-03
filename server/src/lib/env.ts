import "dotenv/config"

import z from "zod";

const envSchema = z.object({
    PORT: z.coerce.number(),
    CORS_ORIGIN: z.string(),
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    AZURE_DI_ENDPOINT: z.string(),
    AZURE_DI_KEY: z.string(),
    AZURE_ACS_CONNECTION_STRING: z.string().optional(),
    AZURE_ACS_SENDER_EMAIL: z.string().optional()
})

export const env = envSchema.parse(process.env);