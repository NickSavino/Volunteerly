import z from "zod";


export const VolunteerModerationStateSchema = z.enum([
    "CLEAR",
    "FLAGGED",
    "RESOLVED",
    "CLOSED",
]);
export type VolunteerModerationState = z.infer<typeof VolunteerModerationStateSchema>;

export const VolunteerModerationTabSchema = z.enum([
    "ALL",
    "FLAGGED",
    "RESOLVED",
    "CLOSED",
]);
export type VolunteerModerationTab = z.infer<typeof VolunteerModerationTabSchema>;

export const ModeratorVolunteerListItemSchema = z.object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    location: z.string(),
    avatarUrl: z.string().optional(),
    flaggedByDisplayName: z.string().optional(),
    latestFlagReason: z.string().optional(),
    pastFlagsCount: z.number().int().nonnegative(),
    completedOpportunities: z.number().int().nonnegative(),
    averageRating: z.number().nonnegative(),
    state: VolunteerModerationStateSchema,
});
export type ModeratorVolunteerListItem = z.infer<typeof ModeratorVolunteerListItemSchema>;

export const ModeratorVolunteerListSchema = z.array(ModeratorVolunteerListItemSchema);
export type ModeratorVolunteerList = z.infer<typeof ModeratorVolunteerListSchema>;