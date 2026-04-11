/**
 * ModeratorService.tsx
 * Handles moderator API requests for tickets, volunteers, and moderator profile data.
 */

import { api } from "@/lib/api";
import {
    CurrentModeratorSchema,
    ModeratorTicketDetail,
    ModeratorTicketDetailSchema,
    ModeratorTicketList,
    ModeratorTicketListSchema,
    ModeratorVolunteerDetail,
    ModeratorVolunteerDetailSchema,
    ModeratorVolunteerEscalateInput,
    ModeratorVolunteerFlagInput,
    ModeratorVolunteerList,
    ModeratorVolunteerListSchema,
    ModeratorVolunteerSuspendInput,
    ModeratorVolunteerWarnInput,
    UpdateCurrentModerator,
} from "@volunteerly/shared";

export class ModeratorService {
    /**
     * Fetches the current moderator profile for the authenticated user.
     * @returns Parsed current moderator result.
     */
    static async getCurrentModerator() {
        const response = await api<unknown>("/current-moderator");
        const parsed = CurrentModeratorSchema.safeParse(response);

        return parsed;
    }

    /**
     * Creates or updates the current moderator profile.
     * @param moderator
     * @returns Parsed current moderator result after persistence.
     */
    static async update_create_Moderator(moderator: UpdateCurrentModerator) {
        const response = await api<unknown>("/current-moderator", {
            method: "PUT",
            body: JSON.stringify(moderator),
        });
        const parsed = CurrentModeratorSchema.safeParse(response);

        return parsed;
    }

    /**
     * Fetches the moderator volunteer list.
     * @returns Promise<ModeratorVolunteerList>
     */
    static async getModeratorVolunteers(): Promise<ModeratorVolunteerList> {
        const json = await api<unknown>("/moderator/volunteers");
        const parsed = ModeratorVolunteerListSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching volunteers.");
        }

        return parsed.data;
    }

    /**
     * Fetches the moderator ticket list.
     * @returns Promise<ModeratorTicketList>
     */
    static async getModeratorTickets(): Promise<ModeratorTicketList> {
        const json = await api<unknown>("/moderator/tickets");
        const parsed = ModeratorTicketListSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching tickets.");
        }

        return parsed.data;
    }

    /**
     * Fetches moderator ticket details for a single ticket.
     * @param ticketId
     * @returns Promise<ModeratorTicketDetail>
     */
    static async getModeratorTicketDetail(ticketId: string): Promise<ModeratorTicketDetail> {
        const json = await api<unknown>(`/moderator/tickets/${ticketId}`);
        const parsed = ModeratorTicketDetailSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching ticket detail.");
        }

        return parsed.data;
    }

    /**
     * Claims a moderator ticket for the authenticated moderator.
     * @param ticketId
     * @returns Promise<ModeratorTicketDetail>
     */
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

    /**
     * Closes a claimed moderator ticket.
     * @param ticketId
     * @returns Promise<ModeratorTicketDetail>
     */
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

    /**
     * Fetches moderator volunteer details for a single volunteer.
     * @param volunteerId
     * @returns Promise<ModeratorVolunteerDetail>
     */
    static async getModeratorVolunteerDetail(
        volunteerId: string,
    ): Promise<ModeratorVolunteerDetail> {
        const json = await api<unknown>(`/moderator/volunteers/${volunteerId}`);
        const parsed = ModeratorVolunteerDetailSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching volunteer detail.");
        }

        return parsed.data;
    }

    /**
     * Flags a volunteer for moderator review.
     * @param volunteerId
     * @param input
     * @returns Promise<{ success: boolean }>
     */
    static async flagVolunteer(volunteerId: string, input: ModeratorVolunteerFlagInput) {
        return api<{ success: boolean }>(`/moderator/volunteers/${volunteerId}/flag`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    /**
     * Issues a warning for an open volunteer report.
     * @param volunteerId
     * @param input
     * @returns Promise<{ success: boolean }>
     */
    static async warnVolunteer(volunteerId: string, input: ModeratorVolunteerWarnInput) {
        return api<{ success: boolean }>(`/moderator/volunteers/${volunteerId}/warn`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    /**
     * Suspends a volunteer from an open moderation report.
     * @param volunteerId
     * @param input
     * @returns Promise<{ success: boolean }>
     */
    static async suspendVolunteer(volunteerId: string, input: ModeratorVolunteerSuspendInput) {
        return api<{ success: boolean }>(`/moderator/volunteers/${volunteerId}/suspend`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    /**
     * Escalates a volunteer moderation case.
     * @param volunteerId
     * @param input
     * @returns Promise<{ success: boolean }>
     */
    static async escalateVolunteer(volunteerId: string, input: ModeratorVolunteerEscalateInput) {
        return api<{ success: boolean }>(`/moderator/volunteers/${volunteerId}/escalate`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }
}
