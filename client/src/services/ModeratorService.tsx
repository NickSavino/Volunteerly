import { api } from "@/lib/api";
import {
    CurrentModeratorSchema,
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

    static async getModeratorTikcets(): Promise<ModeratorTicketList> {
        const json = await api<unknown>("/moderator/tickets")
        const parsed = ModeratorTicketListSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error fetching tickets.");
        }

        return parsed.data;
    }
}
