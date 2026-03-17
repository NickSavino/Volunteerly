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
    length: z.string(),
    deadlineDate: z.iso.datetime().nullable(),
    availability: z.array(z.any()),
    postedDate: z.iso.datetime(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export const OpportunitiesSchema = z.array(OpportunitySchema);