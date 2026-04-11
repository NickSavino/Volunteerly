/**
 * moderator-ticket-detail.ts
 * Defines expanded moderator ticket detail schema.
 */

import type z from "zod";
import { ChatConversationDetailSchema, ChatParticipantSummarySchema } from "../chat/index.js";
import { ModeratorTicketSchema } from "./moderator-tickets.js";

export const ModeratorTicketDetailSchema = ModeratorTicketSchema.extend({
    issuer: ChatParticipantSummarySchema,
    target: ChatParticipantSummarySchema.nullable().optional(),
    conversation: ChatConversationDetailSchema.optional(),
});

export type ModeratorTicketDetail = z.infer<typeof ModeratorTicketDetailSchema>;
