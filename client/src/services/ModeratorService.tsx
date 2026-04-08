import { api } from "@/lib/api";
import {
    CurrentModeratorSchema,
    ModeratorTicketDetail,
    ModeratorTicketDetailSchema,
    ModeratorTicketList,
    ModeratorTicketListSchema,
    ModeratorVolunteerList,
    ModeratorVolunteerListSchema,
    UpdateCurrentModerator,
} from "@volunteerly/shared";

export class ModeratorService {
    static async getCurrentModerator() {
        const response = await api<unknown>("/current-moderator");
        const parsed = CurrentModeratorSchema.safeParse(response);

        return parsed;
    }

    static async update_create_Moderator(moderator: UpdateCurrentModerator) {
        const response = await api<unknown>("/current-moderator", {
            method: "PUT",
            body: JSON.stringify(moderator),
        });
        const parsed = CurrentModeratorSchema.safeParse(response);

        return parsed;
    }

    static async getModeratorVolunteers(): Promise<ModeratorVolunteerList> {
                const json = await api<unknown>("/moderator/volunteers");
                const parsed = ModeratorVolunteerListSchema.safeParse(json);

                if (!parsed.success) {
                    throw new Error("Error fetching volunteers.");
                }
                
                return parsed.data;
        }

    static async getModeratorTickets(): Promise<ModeratorTicketList> {
        const json = await api<unknown>("/moderator/tickets")
        const parsed = ModeratorTicketListSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching tickets.");
        }

        return parsed.data;
    }

        static async getModeratorTicketDetail(ticketId: string): Promise<ModeratorTicketDetail> {
        const json = await api<unknown>(`/moderator/tickets/${ticketId}`);
        const parsed = ModeratorTicketDetailSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching ticket detail.");
        }

        return parsed.data;
    }

    static async claimModeratorTicket(ticketId: string): Promise<ModeratorTicketDetail> {
        const json = await api<unknown>(`/moderator/tickets/${ticketId}/claim`, {
            method: "PATCH",
        });
        const parsed = ModeratorTicketDetailSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error claiming ticket.");
        }

        return parsed.data;
    }

    static async closeModeratorTicket(ticketId: string): Promise<ModeratorTicketDetail> {
        const json = await api<unknown>(`/moderator/tickets/${ticketId}/close`, {
            method: "PATCH",
        });
        const parsed = ModeratorTicketDetailSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error closing ticket.");
        }

        return parsed.data;
    }
}
