import { z } from "zod";

export const ApplicationSchema = z.object({
    id: z.uuid(),
    oppId: z.uuid(),
    volId: z.uuid().nullable(),
    matchPercentage: z.number(),
    message: z.string(),
    dateApplied: z.string(),
    opportunity: z.object({
        id: z.uuid(),
        name: z.string(),        
    }).optional(),
    volunteer: z.object({
        id: z.uuid(),
        firstName: z.string(),
        lastName: z.string(),
        bio: z.string().optional()
    }).optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
export const ApplicationsSchema = z.array(ApplicationSchema);