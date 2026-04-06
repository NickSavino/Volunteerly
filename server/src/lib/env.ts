import "dotenv/config"

import z from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    CORS_ORIGIN: z.string(),
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    AZURE_ACS_CONNECTION_STRING: z.string().optional().default(""),
    AZURE_ACS_SENDER_EMAIL: z.string().optional().default(""),
    AZURE_DI_ENDPOINT: z.string().optional().default(""),
    AZURE_DI_KEY: z.string().optional().default(""), 
    GROQ_API_KEY: z.string().optional().default(""),
    GEMINI_API_KEY: z.string().min(1).optional().default("")
})

export const env = envSchema.parse(process.env);