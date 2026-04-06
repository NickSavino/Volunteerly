import z from "zod";

export const ModeratorTicketStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type ModeratorTicketStatus = z.infer<typeof ModeratorTicketStatusSchema>;

export const ModeratorTicketSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  status: ModeratorTicketStatusSchema,
  category: z.enum(["BUG", "ABUSE", "BILLING", "OTHER"]),
  urgencyRating: z.enum(["MINOR", "MODERATE", "SERIOUS"]),
  createdAt: z.string(),
  issuerId: z.uuid(),
  targetId: z.uuid(),
});
export type ModeratorTicket = z.infer<typeof ModeratorTicketSchema>;

export const ModeratorTicketListSchema = z.array(ModeratorTicketSchema);
export type ModeratorTicketList = z.infer<typeof ModeratorTicketListSchema>;