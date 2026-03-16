import { z } from "zod";

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

export const TicketStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const SupportTicketSchema = z.object({
    id: z.uuid(),
    subject: z.string(),
    description: z.string(),
    status: TicketStatusSchema,
    submittedByEmail: z.email(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type SupportTicket = z.infer<typeof SupportTicketSchema>;

export const SupportTicketsSchema = z.array(SupportTicketSchema);
export type SupportTickets = z.infer<typeof SupportTicketsSchema>;

export const ModeratorDashboardSummarySchema = z.object({
    pendingOrganizationsCount: z.number().int().nonnegative(),
    flaggedAccountsCount: z.number().int().nonnegative(),
    openTicketsCount: z.number().int().nonnegative(),
    recentPendingOrganizations: PendingOrganizationsSchema,
    recentFlaggedAccounts: FlaggedAccountsSchema,
    recentTickets: SupportTicketsSchema,
});
export type ModeratorDashboardSummary = z.infer<typeof ModeratorDashboardSummarySchema>;