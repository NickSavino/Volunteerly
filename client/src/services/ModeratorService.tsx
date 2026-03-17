import { api } from "@/lib/api";
import {
    CurrentModeratorSchema,
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
}
