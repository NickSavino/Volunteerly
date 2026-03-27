import { api } from "@/lib/api";
import {
    CurrentOrganizationSchema,
    CurrentOrganizationUpdate,
    OpportunitiesSchema,
    ModeratorOrganizationList,
    ModeratorOrganizationListItem,
    ModeratorOrganizationListItemSchema,
    ModeratorOrganizationListSchema,
    OrganizationSchema,
    OrganizationsSchema,
    CountSchema,
    TotalHoursSchema
} from "@volunteerly/shared";

export class OrganizationService {

    static async getCurrentOrganization() {
        const response = await api<unknown>("/current-organization");
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    static async update_create_Organization(user: CurrentOrganizationUpdate) {
        const response = await api<unknown>("/current-organization", {
            method: "PUT",
            body: JSON.stringify(user),
        });
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    static async apply(formData: FormData) {
        const response = await api<unknown>("/current-organization/apply", {
            method: "PUT",
            body: formData
        });
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    static async getAllOrganizations(status?: "APPLIED") : Promise<ModeratorOrganizationList> {
        const url = status ? `/organization?status=${status}` : "/organization";
        const response = await api<unknown>(url);
        const parsed = ModeratorOrganizationListSchema.safeParse(response);
        if (!parsed.success) {
            console.error("Organization parse failed:", parsed.error.issues);
            console.error("Raw organization response:", response);
            throw new Error("Error fetching organizations.");
        }
        return parsed.data;
    }

    static async getOrganizationDocument(file_path:string) {
        const url = `/organization/document/?file_path=${file_path}`
        const response = await api<Blob>(url, {responseType: "blob"});
        return response;
    }

    static async approveOrganization(orgId: string) {
        const response = await api<unknown>("/organization/approve", {
            method: "PUT",
            body: JSON.stringify({ orgId }),
        });
        const parsed = OrganizationSchema.safeParse(response);
        return parsed;
    }

    static async rejectOrganization(orgId: string, rejectionReason: string) {
        const response = await api<unknown>("/organization/reject", {
            method: "PUT",
            body: JSON.stringify({ orgId, rejectionReason }),
        });
        const parsed = OrganizationSchema.safeParse(response);
        return parsed;
    }

    static async getAllOpportunities() {
        const response = await api<unknown>("/current-organization/opportunities");
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    static async getActiveOpportunities() {
        const response = await api<unknown>("/current-organization/opportunities/active");
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    static async countAllOpportunities() {
        const response = await api<unknown>("/current-organization/opportunities/totalCount");
        const parsed = CountSchema.safeParse(response)
        return parsed
    }

    static async sumTotalHours() {
        const response = await api<unknown>("/current-organization/opportunities/hoursTotal");
        const parsed = TotalHoursSchema.safeParse(response)
        return parsed
    }

    
}