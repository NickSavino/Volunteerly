import { z } from "zod";

export const ApplicationSchema = z.object({
    id: z.uuid(),
    oppId: z.uuid(),
    volId: z.uuid().nullable(),
    matchPercentage: z.number(),
    message: z.string(),
    dateApplied: z.coerce.date(),
    opportunity: z
        .object({
            id: z.uuid(),
            name: z.string(),
        })
        .optional(),
    volunteer: z
        .object({
            id: z.uuid(),
            firstName: z.string(),
            lastName: z.string(),
            bio: z.string(),
            location: z.string().optional(),
            availability: z.array(z.any()).optional(),
            averageRating: z.number().optional(),
            workExperiences: z
                .array(
                    z.object({
                        id: z.string(),
                        jobTitle: z.string(),
                        company: z.string(),
                        startDate: z.coerce.date().nullable(),
                        endDate: z.coerce.date().nullable(),
                        responsibilities: z.string(),
                    }),
                )
                .optional(),
            educations: z
                .array(
                    z.object({
                        id: z.string(),
                        institution: z.string(),
                        degree: z.string(),
                        graduationYear: z.string(),
                    }),
                )
                .optional(),
        })
        .optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
export const ApplicationsSchema = z.array(ApplicationSchema);
