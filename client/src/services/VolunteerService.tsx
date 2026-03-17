import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { z } from "zod";
import { CurrentVolunteerSchema, CurrentVolunteer, UpdateCurrentVolunteer, OpportunitySchema, OpportunitiesSchema, OrganizationSchema } from "@volunteerly/shared";



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

    static async getYourOpportunities() {
        const response = await api<unknown>("/current-volunteer/opportunities");
        const asArray = Array.isArray(response) ? response : [response];
        const parsed = OpportunitiesSchema.safeParse(asArray);
        return parsed;
    }


    static async getVolunteerOrganizations() {
        const response = await api<unknown>("/current-volunteer/organizations");
        const parsed = z.array(OrganizationSchema).safeParse(response);
        return parsed;
    }

}