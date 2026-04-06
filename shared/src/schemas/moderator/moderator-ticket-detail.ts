import type z from "zod";
import { ChatConversationDetailSchema, ChatParticipantSummarySchema } from "../chat";
import { ModeratorTicketSchema } from "./moderator-tickets";


export const ModeratorTicketDetailSchema = ModeratorTicketSchema.extend({
    issuer: ChatParticipantSummarySchema,
    target: ChatParticipantSummarySchema,
    conversation: ChatConversationDetailSchema.optional(),
});

export type ModeratorTicketDetail = z.infer<typeof ModeratorTicketDetailSchema>;