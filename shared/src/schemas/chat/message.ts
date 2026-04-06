import z from "zod";
import { UserRoleSchema } from "../user.js";

export const ChatMessageSchema = z.object({
    id: z.uuid(),
    conversationId: z.uuid(),
    senderId: z.uuid(),
    senderDisplayName: z.string(),
    senderRole: UserRoleSchema,
    senderAvatarUrl: z.string().optional(),
    content: z.string(),
    sentAt: z.iso.datetime(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatMessagesSchema = z.array(ChatMessageSchema);
export type ChatMessages = z.infer<typeof ChatMessagesSchema>;

export const CreateChatMessageSchema = z.object({
    content: z.string().trim().min(1).max(2000),
});

export type CreateChatMessage = z.infer<typeof CreateChatMessageSchema>;