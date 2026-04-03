import { z } from "zod";

export const PublicOrgProfileSchema = z.object({
    id: z.string(),
    orgName: z.string(),
    missionStatement: z.string(),
    causeCategory: z.string(),
    website: z.string(),
    hqAdr: z.string(),
    impactHighlights: z.array(z.any()).optional(),
    totalVolunteersHired: z.number(),
    economicImpact: z.number(),
});
export type PublicOrgProfile = z.infer<typeof PublicOrgProfileSchema>;