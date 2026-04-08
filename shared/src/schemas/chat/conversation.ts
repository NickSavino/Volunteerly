import z from "zod";
import { UserRoleSchema } from "../user.js";
import { ChatMessagesSchema } from "./message.js";
import { TicketStatusSchema } from "../ticket.js";

export const ConversationKindSchema = z.enum(["DIRECT", "TICKET"]);
export type ConversationKind = z.infer<typeof ConversationKindSchema>;

export const ChatParticipantSummarySchema = z.object({
    userId: z.uuid(),
    displayName: z.string(),
    role: UserRoleSchema,
    avatarUrl: z.string().optional(),
    subtitle: z.string().optional(),
});

export type ChatParticipantSummary = z.infer<typeof ChatParticipantSummarySchema>;

export const ChatConversationListItemSchema = z.object({
    id: z.uuid(),
    kind: ConversationKindSchema,
    ticketId: z.uuid().optional(),
    ticketStatus: TicketStatusSchema.optional(),
    title: z.string().optional(),
    otherParticipant: ChatParticipantSummarySchema.optional(),
    lastMessagePreview: z.string(),
    lastMessageAt: z.iso.datetime(),
    unreadCount: z.number().int().nonnegative(),
});

export type ChatConversationListItem = z.infer<typeof ChatConversationListItemSchema>;

export const ChatConversationListSchema = z.array(ChatConversationListItemSchema);
export type ChatConversationList = z.infer<typeof ChatConversationListSchema>;

export const ChatConversationDetailSchema = z.object({
    id: z.uuid(),
    kind: ConversationKindSchema,
    ticketId: z.uuid().optional(),
    ticketStatus: TicketStatusSchema.optional(),
    title: z.string().optional(),
    participants: z.array(ChatParticipantSummarySchema).min(1),
    messages: ChatMessagesSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    lastMessageAt: z.iso.datetime(),
});

export type ChatConversationDetail = z.infer<typeof ChatConversationDetailSchema>;