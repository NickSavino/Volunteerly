import { z } from "zod";

export const ImpactHighlightSchema = z.object({
    value: z.number(),
    label: z.string(),
});
export type ImpactHighlight = z.infer<typeof ImpactHighlightSchema>;

export const PublicOrgProfileSchema = z.object({
    id: z.string(),
    orgName: z.string(),
    missionStatement: z.string(),
    causeCategory: z.string(),
    website: z.string(),
    hqAdr: z.string(),
    impactHighlights: z.array(ImpactHighlightSchema),
    totalVolunteersHired: z.number(),
    activeOpportunities: z.number(),
    averageRating: z.number().nullable(),
    reviewCount: z.number(),
});
export type PublicOrgProfile = z.infer<typeof PublicOrgProfileSchema>;
