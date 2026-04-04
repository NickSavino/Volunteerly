import "dotenv/config"

import z from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    CORS_ORIGIN: z.string(),
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    AZURE_DI_ENDPOINT: z.string().optional().default(""),
    AZURE_DI_KEY: z.string().optional().default(""), 
    GROQ_API_KEY: z.string(),
    GEMINI_API_KEY: z.string().min(1)
})

export const env = envSchema.parse(process.env);