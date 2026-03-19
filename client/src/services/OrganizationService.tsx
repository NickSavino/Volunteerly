import { api } from "@/lib/api";
import {
    CurrentOrganizationSchema,
    CurrentOrganizationUpdateSchema,
    OrganizationSchema,
    OrganizationsSchema,
} from "@volunteerly/shared";

export class OrganizationService {

    static async getCurrentOrganization() {
        const response = await api<unknown>("/current-organization");
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    static async update_create_Organization(user: CurrentOrganizationUpdateSchema) {
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

    static async getAllOrganizations(status?: "APPLIED") {
        const url = status ? `/organization?status=${status}` : "/organization";
        const response = await api<unknown>(url);
        const parsed = OrganizationsSchema.safeParse(response);
        return parsed;
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