/**
 * moderator.ts
 * Defines moderator dashboard and profile schemas.
 */

import { z } from "zod";
import { ModeratorTicketListSchema } from "./moderator-tickets.js";

export const PendingOrganizationSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    documentUrl: z.url().optional(),
    createdAt: z.iso.datetime(),
});
export type PendingOrganization = z.infer<typeof PendingOrganizationSchema>;

export const PendingOrganizationsSchema = z.array(PendingOrganizationSchema);
export type PendingOrganizations = z.infer<typeof PendingOrganizationsSchema>;

export const FlaggedAccountSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    firstName: z.string(),
    lastName: z.string(),
    reason: z.string().optional(),
    flaggedAt: z.iso.datetime(),
});
export type FlaggedAccount = z.infer<typeof FlaggedAccountSchema>;

export const FlaggedAccountsSchema = z.array(FlaggedAccountSchema);
export type FlaggedAccounts = z.infer<typeof FlaggedAccountsSchema>;

export const ModeratorDashboardSummarySchema = z.object({
    pendingOrganizationsCount: z.number().int().nonnegative(),
    flaggedAccountsCount: z.number().int().nonnegative(),
    openTicketsCount: z.number().int().nonnegative(),
    recentPendingOrganizations: PendingOrganizationsSchema,
    recentFlaggedAccounts: FlaggedAccountsSchema,
    recentTickets: ModeratorTicketListSchema,
});
export type ModeratorDashboardSummary = z.infer<typeof ModeratorDashboardSummarySchema>;

export const ModeratorSchema = z.object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type Moderator = z.infer<typeof ModeratorSchema>;

export const CurrentModeratorSchema = z.object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type CurrentModerator = z.infer<typeof CurrentModeratorSchema>;

export const CreateCurrentModeratorSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
});
export type CreateCurrentModerator = z.infer<typeof CreateCurrentModeratorSchema>;

export const UpdateCurrentModeratorSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});
export type UpdateCurrentModerator = z.infer<typeof UpdateCurrentModeratorSchema>;
