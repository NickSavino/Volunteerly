/**
 * ticket.ts
 * Defines ticket status, category, urgency, and ticket creation schemas.
 */

import z from "zod";

export const TicketStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const TicketCategorySchema = z.enum(["BUG", "ABUSE", "BILLING", "OTHER"]);
export type TicketCategory = z.infer<typeof TicketCategorySchema>;

export const UrgencyRatingSchema = z.enum(["MINOR", "MODERATE", "SERIOUS"]);
export type UrgencyRating = z.infer<typeof UrgencyRatingSchema>;

export const CreateTicketSchema = z.object({
    category: TicketCategorySchema,
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    urgencyRating: UrgencyRatingSchema,
});
export type CreateTicket = z.infer<typeof CreateTicketSchema>;

export const CreatedTicketSchema = z.object({
    id: z.uuid(),
    conversationId: z.uuid(),
    status: TicketStatusSchema,
});
export type CreatedTicket = z.infer<typeof CreatedTicketSchema>;
