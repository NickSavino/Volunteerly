import z from "zod";
import { TicketCategorySchema, TicketStatusSchema, UrgencyRatingSchema } from "../ticket.js";

export const ModeratorTicketStatusSchema = TicketStatusSchema;
export type ModeratorTicketStatus = z.infer<typeof ModeratorTicketStatusSchema>;

export const ModeratorTicketCategorySchema = TicketCategorySchema;
export type ModeratorTicketCategory = z.infer<typeof ModeratorTicketCategorySchema>;

export const ModeratorUrgencyRatingSchema = UrgencyRatingSchema;
export type ModeratorUrgencyRating = z.infer<typeof ModeratorUrgencyRatingSchema>;

export const ModeratorTicketSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  status: ModeratorTicketStatusSchema,
  category: ModeratorTicketCategorySchema,
  urgencyRating: ModeratorUrgencyRatingSchema,
  createdAt: z.iso.datetime(),
  issuerId: z.uuid(),
  targetId: z.uuid().nullable().optional(),
});
export type ModeratorTicket = z.infer<typeof ModeratorTicketSchema>;

export const ModeratorTicketListSchema = z.array(ModeratorTicketSchema);
export type ModeratorTicketList = z.infer<typeof ModeratorTicketListSchema>;