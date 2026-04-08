import { z } from "zod";

export const OpportunityAnalyticsSchema = z.object({
    hours: z.number(),
    value: z.number(),
});
export const ProgressUpdateSchema = z.object({
    id: z.uuid().optional(),
    opportunityId: z.uuid().optional(),
    senderId: z.uuid().optional(),
    senderRole: z.enum(["VOLUNTEER", "ORGANIZATION"]).optional(),
    title: z.string(),
    description: z.string(),
    hoursContributed: z.number(),
    createdAt: z.coerce.date().optional(),
});
export type ProgressUpdate = z.infer<typeof ProgressUpdateSchema>;

export const OpportunitySchema = z.object({
    id: z.uuid(),
    orgId: z.uuid(),
    volId: z.uuid().nullable(),
    status: z.enum(["OPEN", "FILLED", "CLOSED", "CANCELLED"]),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    candidateDesc: z.string(),
    workType: z.enum(["IN_PERSON", "REMOTE", "HYBRID"]),
    commitmentLevel: z.enum(["FLEXIBLE", "PART_TIME", "FULL_TIME"]),
    hours: z.number(),
    length: z.string(),
    deadlineDate: z.coerce.date().nullable(),
    availability: z.array(z.any()),
    postedDate: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    organization: z
        .object({
            id: z.uuid(),
            orgName: z.string(),
            hqAdr: z.string().optional(),
            causeCategory: z.string().optional(),
        })
        .optional(),
    volunteer: z
        .object({
            id: z.uuid(),
            firstName: z.string(),
            lastName: z.string(),
        })
        .nullish(),
    _count: z.object({ applications: z.number() }).optional(),
    progressUpdates: z
        .array(
            z.object({
                id: z.uuid(),
                senderRole: z.enum(["VOLUNTEER", "ORGANIZATION"]),
                title: z.string(),
                description: z.string(),
                hoursContributed: z.number(),
                createdAt: z.coerce.date(),
            }),
        )
        .nullish(),
    skill_vector: z.array(z.number()).optional(),
});

export const UpdateOpportunitySchema = z.object({
    orgId: z.uuid(),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    candidateDesc: z.string(),
    workType: z.enum(["IN_PERSON", "REMOTE", "HYBRID"]),
    commitmentLevel: z.enum(["FLEXIBLE", "PART_TIME", "FULL_TIME"]),
    length: z.string(),
    deadlineDate: z.coerce.date(),
    availability: z.array(z.any()),
});

export type UpdateOpportunitySchema = z.infer<typeof UpdateOpportunitySchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export const OpportunitiesSchema = z.array(OpportunitySchema);
export type Opportunities = z.infer<typeof OpportunitiesSchema>;

export const OpportunityFiltersSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    workType: z.enum(["IN_PERSON", "REMOTE", "HYBRID"]).optional(),
    commitmentLevel: z.enum(["FLEXIBLE", "PART_TIME", "FULL_TIME"]).optional(),
    maxHours: z.number().optional(),
});
export type OpportunityFilters = z.infer<typeof OpportunityFiltersSchema>;
