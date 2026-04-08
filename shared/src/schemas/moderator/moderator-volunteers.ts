import z from "zod";
import { ModeratorUrgencyRatingSchema } from "./moderator-tickets.js";
import { UserRoleSchema } from "../user.js";

export const VolunteerModerationStateSchema = z.enum(["CLEAR", "FLAGGED", "RESOLVED", "CLOSED"]);
export type VolunteerModerationState = z.infer<typeof VolunteerModerationStateSchema>;

export const VolunteerModerationTabSchema = z.enum(["ALL", "FLAGGED", "RESOLVED", "CLOSED"]);
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

export const VolunteerReportActionSchema = z.enum(["WARNING", "SUSPEND", "ESCALATE"]);
export type VolunteerReportAction = z.infer<typeof VolunteerReportActionSchema>;

export const ModeratorVolunteerReportSchema = z.object({
    id: z.uuid(),
    reason: z.string(),
    details: z.string().optional(),
    severity: ModeratorUrgencyRatingSchema.nullable().optional(),
    isOpen: z.boolean(),
    createdAt: z.iso.datetime(),
    reporterId: z.uuid(),
    reporterDisplayName: z.string(),
    reporterRole: UserRoleSchema,
    actionTaken: VolunteerReportActionSchema.nullable().optional(),
    moderatorNote: z.string().optional(),
    moderatedByDisplayName: z.string().optional(),
    resolvedAt: z.iso.datetime().nullable().optional(),
    suspensionUntil: z.iso.datetime().nullable().optional(),
});
export type ModeratorVolunteerReport = z.infer<typeof ModeratorVolunteerReportSchema>;

export const ModeratorVolunteerDetailSchema = z.object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    location: z.string(),
    bio: z.string(),
    availability: z.array(z.any()).optional(),
    pastFlagsCount: z.number().int().nonnegative(),
    completedOpportunities: z.number().int().nonnegative(),
    averageRating: z.number().nonnegative(),
    hourlyValue: z.number().int().nonnegative(),
    state: VolunteerModerationStateSchema,
    technicalSkills: z.array(z.string()).default([]),
    nonTechnicalSkills: z.array(z.string()).default([]),
    reports: z.array(ModeratorVolunteerReportSchema),
});
export type ModeratorVolunteerDetail = z.infer<typeof ModeratorVolunteerDetailSchema>;

export const ModeratorVolunteerFlagInputSchema = z.object({
    reason: z.string().min(1),
    details: z.string().optional(),
    severity: ModeratorUrgencyRatingSchema.optional(),
});
export type ModeratorVolunteerFlagInput = z.infer<typeof ModeratorVolunteerFlagInputSchema>;

export const ModeratorVolunteerWarnInputSchema = z.object({
    reportId: z.uuid(),
    reason: z.string().min(1),
    severity: ModeratorUrgencyRatingSchema,
});
export type ModeratorVolunteerWarnInput = z.infer<typeof ModeratorVolunteerWarnInputSchema>;

export const ModeratorVolunteerSuspendInputSchema = z.object({
    reportId: z.uuid(),
    reason: z.string().min(1),
    durationDays: z.number().int().positive(),
});
export type ModeratorVolunteerSuspendInput = z.infer<typeof ModeratorVolunteerSuspendInputSchema>;

export const ModeratorVolunteerEscalateInputSchema = z.object({
    reportId: z.uuid(),
    reason: z.string().min(1),
});
export type ModeratorVolunteerEscalateInput = z.infer<typeof ModeratorVolunteerEscalateInputSchema>;
