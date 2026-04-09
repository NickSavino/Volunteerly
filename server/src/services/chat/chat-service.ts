import { ChatConversationDetail, ChatConversationList, ChatMessage } from "@volunteerly/shared";
import { prisma } from "../../lib/prisma.js";
import { getDisplayName } from "../helpers/service-utils.js";
import {
    chatConversationDetailArgs,
    ChatConversationDetailRecord,
    chatConversationListArgs,
    ChatConversationListRecord,
    ChatMessageRecord,
    chatMessageWithSenderArgs,
} from "./chat.queries.js";

function toChatMessage(message: ChatMessageRecord): ChatMessage {
    return {
        id: message.id,
        content: message.content,
        conversationId: message.conversationId,
        senderDisplayName: getDisplayName(message.sender ?? undefined),
        senderRole: message.sender?.role ?? message.senderRoleSnapshot ?? "UNKNOWN",
        senderAvatarUrl: undefined,
        sentAt: message.sentAt.toISOString(),
        senderId: message.senderId ?? undefined,
    };
}

export async function getChatConversationList(userId: string): Promise<ChatConversationList> {
    const conversations: ChatConversationListRecord[] = await prisma.chatConversation.findMany({
        where: {
            participants: {
                some: { userId },
            },
        },
        ...chatConversationListArgs,
        orderBy: {
            lastMessageAt: "desc",
        },
    });

    return conversations.map((conversation) => {
        const latestMessage = conversation.messages[0];
        const otherParticipant = conversation.participants.find(
            (participant) => participant.userId !== userId,
        );

        return {
            id: conversation.id,
            kind: conversation.kind,
            ticketId: conversation.ticketId ?? undefined,
            ticketStatus: conversation.ticket?.status ?? undefined,
            title: conversation.ticket?.title ?? undefined,
            otherParticipant: otherParticipant
                ? {
                      userId: otherParticipant.userId,
                      displayName: getDisplayName(otherParticipant.user),
                      role: otherParticipant.user.role,
                      avatarUrl: undefined,
                      subtitle: undefined,
                  }
                : undefined,
            lastMessagePreview: latestMessage?.content ?? "",
            lastMessageAt: conversation.lastMessageAt.toISOString(),
            unreadCount: 0,
        };
    });
}

export async function getChatConversationDetail(
    userId: string,
    conversationId: string,
): Promise<ChatConversationDetail | null> {
    const conversation: ChatConversationDetailRecord | null =
        await prisma.chatConversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: { userId },
                },
            },
            ...chatConversationDetailArgs,
        });

    if (!conversation) return null;

    return {
        id: conversation.id,
        kind: conversation.kind,
        ticketId: conversation.ticketId ?? undefined,
        ticketStatus: conversation.ticket?.status ?? undefined,
        title: conversation.ticket?.title ?? undefined,
        participants: conversation.participants.map((participant) => ({
            userId: participant.user.id,
            displayName: getDisplayName(participant.user),
            role: participant.user.role,
            avatarUrl: undefined,
            subtitle: undefined,
        })),
        messages: conversation.messages.map(toChatMessage),
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessageAt: conversation.lastMessageAt.toISOString(),
    };
}

export async function createChatMessage(
    userId: string,
    conversationId: string,
    content: string,
): Promise<ChatMessage | null> {
    const conversation = await prisma.chatConversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                some: { userId },
            },
        },
        select: {
            id: true,
            kind: true,
            ticket: {
                select: {
                    status: true,
                },
            },
        },
    });

    if (!conversation) return null;

    if (conversation.kind === "TICKET" && conversation.ticket?.status === "CLOSED") {
        throw new Error("TICKET_CLOSED");
    }

    const message = await prisma.$transaction(async (tx) => {
        const createdMessage = await tx.chatMessage.create({
            data: {
                conversationId,
                senderId: userId,
                content,
            },
            ...chatMessageWithSenderArgs,
        });

        await tx.chatConversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: createdMessage.sentAt,
            },
        });

        return createdMessage;
    });

    return toChatMessage(message);
}

export async function getOrCreateDirectConversation(userId: string, participantUserId: string) {
    const existingConversation = await prisma.chatConversation.findFirst({
        where: {
            kind: "DIRECT",
            AND: [
                { participants: { some: { userId } } },
                { participants: { some: { userId: participantUserId } } },
                {
                    participants: {
                        every: {
                            userId: { in: [userId, participantUserId] },
                        },
                    },
                },
            ],
        },
        select: { id: true },
    });

    if (existingConversation) {
        return existingConversation;
    }

    return prisma.chatConversation.create({
        data: {
            kind: "DIRECT",
            participants: {
                create: [{ userId }, { userId: participantUserId }],
            },
        },
        select: { id: true },
    });
}
