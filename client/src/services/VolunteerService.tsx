import { api } from "@/lib/api";
import { z } from "zod";
import {
    CurrentVolunteerSchema,
    OpportunitiesSchema,
    type OpportunityFilters,
    type UpdateCurrentVolunteer,
} from "@volunteerly/shared";

const PartnerOrgSchema = z.object({
    id: z.string().uuid(),
    orgName: z.string(),
    totalHours: z.number(),
});
export type PartnerOrg = z.infer<typeof PartnerOrgSchema>;
const PartnerOrgsSchema = z.array(PartnerOrgSchema);

const MonthlyHoursSchema = z.record(z.string(), z.number());
export type MonthlyHours = z.infer<typeof MonthlyHoursSchema>;

export class VolunteerService {

    static async getCurrentVolunteer() {
        const response = await api<unknown>("/current-volunteer");
        return CurrentVolunteerSchema.safeParse(response);
    }

    static async update_create_Volunteer(user: UpdateCurrentVolunteer) {
        const response = await api<unknown>("/current-volunteer", {
            method: "PUT",
            body: JSON.stringify(user),
        });
        return CurrentVolunteerSchema.safeParse(response);
    }

    static async getYourOpportunities() {
        const response = await api<unknown>("/current-volunteer/opportunities");
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    static async getVolunteerOrganizations() {
        const response = await api<unknown>("/current-volunteer/organizations");
        const asArray = Array.isArray(response) ? response : [response];
        return PartnerOrgsSchema.safeParse(asArray);
    }

    static async getMonthlyHours() {
        const response = await api<unknown>("/current-volunteer/monthly-hours");
        return MonthlyHoursSchema.safeParse(response);
    }

    static async applyToOpportunity(oppId: string, message: string) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/apply`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    }

    static async browseOpportunities(filters: OpportunityFilters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category) params.set("category", filters.category);
        if (filters.workType) params.set("workType", filters.workType);
        if (filters.commitmentLevel) params.set("commitmentLevel", filters.commitmentLevel);
        if (filters.maxHours !== undefined) params.set("maxHours", String(filters.maxHours));

        const query = params.toString();
        const response = await api<unknown>(
            `/current-volunteer/opportunities/browse${query ? `?${query}` : ""}`
        );
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }
}