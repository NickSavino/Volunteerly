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
    }).optional(),
    volunteer: z.object({
        id: z.uuid(),
        firstName: z.string(),
        lastName: z.string(),
    }).nullish(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export const OpportunitiesSchema = z.array(OpportunitySchema);