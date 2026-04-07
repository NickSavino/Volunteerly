import { ModeratorTicketDetail, ModeratorTicketList } from "@volunteerly/shared";
import { prisma } from "../../lib/prisma.js";
import { getDisplayName } from "../helpers/service-utils.js";
import { moderatorTicketDetailInclude } from "./moderator-ticket.queries.js";


export async function getModeratorTicketList(): Promise<ModeratorTicketList> {
    const tickets = await prisma.ticket.findMany({
        orderBy: { createdAt: "desc" },
    });
    
    return tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        category: ticket.category,
        createdAt: ticket.createdAt.toISOString(),
        issuerId: ticket.issuerId,
        targetId: ticket.targetId,
        urgencyRating: ticket.urgencyRating,
    }));
}

export async function getModeratorTicketDetail(ticketId: string): Promise<ModeratorTicketDetail | null> {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        ...moderatorTicketDetailInclude,
    });

    if (!ticket) return null;

    const detail: ModeratorTicketDetail = {
        id: ticket.id,
        category: ticket.category,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        urgencyRating: ticket.urgencyRating,
        createdAt: ticket.createdAt.toISOString(),
        issuerId: ticket.issuerId,
        targetId: ticket.targetId,
        issuer: {
            userId: ticket.issuer.id,
            role: ticket.issuer.role,
            avatarUrl: undefined,
            subtitle: undefined,
            displayName: getDisplayName(ticket.issuer)
        },
        target: {
            userId: ticket.target.id,
            role: ticket.target.role,
            avatarUrl: undefined,
            subtitle: undefined,
            displayName: getDisplayName(ticket.target)
        },
        conversation: ticket.conversation
            ? {
                id: ticket.conversation.id,
                kind: ticket.conversation.kind,
                ticketId: ticket.conversation.ticketId ?? undefined,
                title: ticket.title,
                participants: ticket.conversation.participants.map((participant) => ({
                    userId: participant.user.id,
                    displayName: getDisplayName(participant.user),
                    role: participant.user.role,
                    avatarUrl: undefined,
                    subtitle: undefined,
                })),
                messages: ticket.conversation.messages.map((message) => ({
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    senderDisplayName: getDisplayName(message.sender),
                    senderRole: message.sender.role,
                    senderAvatarUrl: undefined,
                    content: message.content,
                    sentAt: message.sentAt.toISOString(),
                })),
                createdAt: ticket.conversation.createdAt.toISOString(),
                updatedAt: ticket.conversation.updatedAt.toISOString(),
                lastMessageAt: ticket.conversation.lastMessageAt.toISOString(),
            }
            : undefined
    } 

    return detail
}