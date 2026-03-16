import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { CurrentOrganizationSchema, CurrentOrganization, CurrentOrganizationUpdateSchema } from "@volunteerly/shared";


export class OrganizationService {

    static async getCurrentOrganization() {
        const response = await api<unknown>("/current-organization");
        const parsed = CurrentOrganizationSchema.safeParse(response)

        return parsed
    }

    static async update_create_Organization(user: CurrentOrganizationUpdateSchema) {
        const response = await api<unknown>("/current-organization", {
            method:"PUT",
            body: JSON.stringify(user)
        });
        const parsed = CurrentOrganizationSchema.safeParse(response)

        return parsed
    }

    static async apply(user: CurrentOrganizationUpdateSchema) {
        const response = await api<unknown>("/current-organization/apply");
        const parsed = CurrentOrganizationSchema.safeParse(response)

        return parsed
    }


}