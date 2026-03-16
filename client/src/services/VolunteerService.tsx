import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { CurrentVolunteerSchema, CurrentVolunteer, UpdateCurrentVolunteer } from "@volunteerly/shared";


export class VolunteerService {

    static async getCurrentVolunteer() {
        const response = await api<unknown>("/current-volunteer");
        const parsed = CurrentVolunteerSchema.safeParse(response)

        return parsed
    }

    static async update_create_Volunteer(user: UpdateCurrentVolunteer) {
        const response = await api<unknown>("/current-volunteer", {
            method:"PUT",
            body: JSON.stringify(user)
        });
        const parsed = CurrentVolunteerSchema.safeParse(response)

        return parsed
    }

}