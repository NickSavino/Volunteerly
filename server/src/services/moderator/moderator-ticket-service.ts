import { ModeratorTicketDetail, ModeratorTicketList } from "@volunteerly/shared";
import { prisma } from "../../lib/prisma.js";
import { getDisplayName } from "../helpers/service-utils.js";
import { moderatorTicketDetailInclude, ModeratorTicketDetailRecord } from "./moderator-ticket.queries.js";
import { ensureTicketConversation } from "../ticket-service.js";

function toModeratorTicketDetail(ticket: ModeratorTicketDetailRecord): ModeratorTicketDetail {
    return {
        id: ticket.id,
        category: ticket.category,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        urgencyRating: ticket.urgencyRating,
        createdAt: ticket.createdAt.toISOString(),
        issuerId: ticket.issuerId,
        targetId: ticket.targetId ?? undefined,
        issuer: {
            userId: ticket.issuer.id,
            role: ticket.issuer.role,
            avatarUrl: undefined,
            subtitle: undefined,
            displayName: getDisplayName(ticket.issuer),
        },
        target: ticket.target
            ? {
                  userId: ticket.target.id,
                  role: ticket.target.role,
                  avatarUrl: undefined,
                  subtitle: undefined,
                  displayName: getDisplayName(ticket.target),
              }
            : undefined,
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
                      senderId: message.senderId ?? undefined,
                      senderDisplayName: getDisplayName(message.sender ?? undefined),
                      senderRole: message.sender?.role ?? message.senderRoleSnapshot ?? "UNKNOWN",
                      senderAvatarUrl: undefined,
                      content: message.content,
                      sentAt: message.sentAt.toISOString(),
                  })),
                  createdAt: ticket.conversation.createdAt.toISOString(),
                  updatedAt: ticket.conversation.updatedAt.toISOString(),
                  lastMessageAt: ticket.conversation.lastMessageAt.toISOString(),
              }
            : undefined,
    };
}

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
        targetId: ticket.targetId ?? undefined,
        urgencyRating: ticket.urgencyRating,
    }));
}

export async function getModeratorTicketDetail(ticketId: string): Promise<ModeratorTicketDetail | null> {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        ...moderatorTicketDetailInclude,
    });

    return ticket ? toModeratorTicketDetail(ticket) : null;
}

export async function claimModeratorTicket(ticketId: string, moderatorId: string): Promise<ModeratorTicketDetail> {
    await prisma.$transaction(async (tx) => {
        const ticket = await tx.ticket.findUnique({
            where: { id: ticketId },
            select: {
                id: true,
                issuerId: true,
                description: true,
                status: true,
                conversation: {
                    select: { id: true },
                },
            },
        });

        if (!ticket) throw new Error("TICKET_NOT_FOUND");
        if (ticket.status === "CLOSED") throw new Error("TICKET_CLOSED");

        await tx.ticket.update({
            where: { id: ticketId },
            data: { targetId: moderatorId },
        });

        if (ticket.conversation?.id) {
            await tx.chatConversationParticipant.deleteMany({
                where: {
                    conversationId: ticket.conversation.id,
                    user: { role: "MODERATOR" },
                },
            });
        }

        await ensureTicketConversation(tx, {
            ticketId: ticket.id,
            issuerId: ticket.issuerId,
            description: ticket.description,
            moderatorId,
        });
    });

    const detail = await getModeratorTicketDetail(ticketId);
    if (!detail) throw new Error("TICKET_NOT_FOUND");
    return detail;
}

export async function closeModeratorTicket(ticketId: string, moderatorId: string): Promise<ModeratorTicketDetail> {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: {
            id: true,
            status: true,
            targetId: true,
        },
    });

    if (!ticket) throw new Error("TICKET_NOT_FOUND");
    if (ticket.status === "CLOSED") throw new Error("TICKET_CLOSED");
    if (ticket.targetId !== moderatorId) throw new Error("TICKET_NOT_ASSIGNED");

    await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "CLOSED" },
    });

    const detail = await getModeratorTicketDetail(ticketId);
    if (!detail) throw new Error("TICKET_NOT_FOUND");
    return detail;
}
