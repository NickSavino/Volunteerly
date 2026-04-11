/**
 * ticket-service.ts
 * Handles ticket creation and ticket conversation setup.
 */

import type { Prisma } from "@prisma/client";
import { CreateTicket, CreatedTicket } from "@volunteerly/shared";
import { prisma } from "../lib/prisma.js";

/**
 * Upserts a conversation participant for the given conversation and user.
 * @param tx - Prisma transaction client
 * @param conversationI
 * @param userId
 */
async function upsertConversationParticipant(
    tx: Prisma.TransactionClient,
    conversationId: string,
    userId: string,
) {
    await tx.chatConversationParticipant.upsert({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
        update: {},
        create: {
            conversationId,
            userId,
        },
    });
}

type EnsureTicketConversationInput = {
    ticketId: string;
    issuerId: string;
    description: string;
    moderatorId?: string | null;
};

/**
 * Ensures a ticket conversation exists and includes the required participants.
 * @param tx - Prisma transaction client
 * @param input - Object containing ticketId, issuerId, description, and optional moderatorId
 * @returns Promise<{ id: string }>
 */
export async function ensureTicketConversation(
    tx: Prisma.TransactionClient,
    { ticketId, issuerId, description, moderatorId }: EnsureTicketConversationInput,
) {
    const existingConversation = await tx.chatConversation.findUnique({
        where: { ticketId },
        select: { id: true },
    });

    if (existingConversation) {
        await upsertConversationParticipant(tx, existingConversation.id, issuerId);

        if (moderatorId) {
            await upsertConversationParticipant(tx, existingConversation.id, moderatorId);
        }

        return existingConversation;
    }

    const conversation = await tx.chatConversation.create({
        data: {
            kind: "TICKET",
            ticketId,
            participants: {
                create: moderatorId
                    ? [{ userId: issuerId }, { userId: moderatorId }]
                    : [{ userId: issuerId }],
            },
        },
        select: { id: true },
    });

    const initialMessage = await tx.chatMessage.create({
        data: {
            conversationId: conversation.id,
            senderId: issuerId,
            content: description,
        },
        select: { sentAt: true },
    });

    await tx.chatConversation.update({
        where: { id: conversation.id },
        data: {
            lastMessageAt: initialMessage.sentAt,
        },
    });

    return conversation;
}

/**
 * Creates a new ticket and initializes its linked conversation.
 * @param issuerId
 * @param input - Object containing category, title, description, and urgencyRating for the new ticket
 * @returns Promise<CreatedTicket>
 */
export async function createTicket(issuerId: string, input: CreateTicket): Promise<CreatedTicket> {
    return prisma.$transaction(async (tx) => {
        const ticket = await tx.ticket.create({
            data: {
                issuerId,
                targetId: null,
                category: input.category,
                title: input.title,
                description: input.description,
                urgencyRating: input.urgencyRating,
                status: "OPEN",
            },
        });

        const conversation = await ensureTicketConversation(tx, {
            ticketId: ticket.id,
            issuerId,
            description: ticket.description,
        });

        return {
            id: ticket.id,
            conversationId: conversation.id,
            status: ticket.status,
        };
    });
}
