import { api } from "@/lib/api";
import {
    CurrentOrganizationSchema,
    CurrentOrganizationUpdate,
    ModeratorOrganizationList,
    ModeratorOrganizationListItem,
    ModeratorOrganizationListItemSchema,
    ModeratorOrganizationListSchema,
    OrganizationSchema,
    OrganizationsSchema,
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

    static async apply(user: CurrentOrganizationUpdate) {
        const response = await api<unknown>("/current-organization/apply", {
            method: "PUT",
            body: JSON.stringify(user),
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
}