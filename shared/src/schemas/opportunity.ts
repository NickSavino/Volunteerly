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
    deadlineDate: z.coerce.date().nullable(),
    availability: z.array(z.any()),
    postedDate: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    organization: z.object({
        id: z.uuid(),
        orgName: z.string(),
    }).optional(),
    volunteer: z.object({
        id: z.uuid(),
        firstName: z.string(),
        lastName: z.string(),
    }).nullish(),
    _count: z.object({ applications: z.number() }).optional(),
    progressUpdates: z.array(
        z.object({
            id: z.uuid(),
            senderRole: z.enum(["VOLUNTEER", "ORGANIZATION"]),
            title: z.string(),
            description: z.string(),
            hoursContributed: z.number(),
            createdAt: z.coerce.date(),
        })
    ).nullish()
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export const OpportunitiesSchema = z.array(OpportunitySchema);