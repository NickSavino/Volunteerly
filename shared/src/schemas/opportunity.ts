import { z } from "zod";

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
    deadlineDate: z.string().nullable(),
    availability: z.array(z.any()),
    postedDate: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    organization: z.object({
        id: z.uuid(),
        orgName: z.string(),
        hqAdr: z.string().optional(),
        causeCategory: z.string().optional(),
    }).optional(),
    volunteer: z.object({
        id: z.uuid(),
        firstName: z.string(),
        lastName: z.string(),
    }).nullish(),
});

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