import { ModeratorTicketList } from "@volunteerly/shared";
import { prisma } from "../../lib/prisma.js";

export async function getModeratorTicketList(): Promise<ModeratorTicketList> {
    const tickets = await prisma.ticket.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            category: true,
            createdAt: true,
            issuerId: true,
            targetId: true,
            urgencyRating: true
        }
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