import z from "zod";

export const ApiErrorSchema = z.object({
    error: z.string(),
    message: z.string().optional(),
    statusCode: z.number().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
