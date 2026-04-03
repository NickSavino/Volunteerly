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
    TotalHoursSchema,
    OpportunitySchema,
    ApplicationsSchema,
    ApplicationSchema,
    OpportunityAnalyticsSchema,
    ProgressUpdate,
    ProgressUpdateSchema,
    Opportunity,
    UpdateOpportunitySchema
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

    static async countActiveVolunteers() {
        const response = await api<unknown>("/current-organization/opportunities/activeTotal");
        const parsed = CountSchema.safeParse(response)
        return parsed
    }

    static async sumTotalHours() {
        const response = await api<unknown>("/current-organization/opportunities/hoursTotal");
        const parsed = TotalHoursSchema.safeParse(response)
        return parsed
    }

    static async getOpportunity(oppId: string) {
        const url = `/current-organization/opportunity/?opp_id=${oppId}`
        const response = await api<unknown>(url);
        const parsed = OpportunitySchema.safeParse(response)
        return parsed
    }

    static async getApplications(oppId: string) {
        const url = `/current-organization/opportunity/applications/?opp_id=${oppId}`
        const response = await api<unknown>(url);
        const asArray = Array.isArray(response) ? response : [response];
        return ApplicationsSchema.safeParse(asArray);
    }

    static async getApplication(appId: string) {
        const url = `/current-organization/opportunity/application/?app_id=${appId}`
        const response = await api<unknown>(url);
        const parsed = ApplicationSchema.safeParse(response)
        return parsed
    }
    
    static async selectOppVolunteer(oppId: string, vltId:string) {
        const response = await api<unknown>("/current-organization/opportunity/select", {
            method: "PUT",
            body: JSON.stringify({ oppId, vltId }),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }
    static async completeOpportunity(oppId: string) {
        const response = await api<unknown>("/current-organization/opportunity/complete", {
            method: "PUT",
            body: JSON.stringify({oppId}),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }
    static async getOpportunityAnalytics(oppId:string) {
        const url = `/current-organization/opportunity/analytics/?oppId=${oppId}`
        const response = await api<unknown>(url);
        const parsed = OpportunityAnalyticsSchema.safeParse(response)
        return parsed
    }
    static async addProgressUpdate(progressUpdate: ProgressUpdate) {
        const response = await api<unknown>("/current-organization/opportunity/progressUpdate", {
            method: "POST",
            body: JSON.stringify(progressUpdate),
        });
        const parsed = ProgressUpdateSchema.safeParse(response);
        return parsed;
    }

    static async addOpportunity(opportunity: UpdateOpportunitySchema) {
        const response = await api<unknown>("/current-organization/opportunity", {
            method: "POST",
            body: JSON.stringify(opportunity),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }
    static async updateOpportunity(opportunityId:string,opportunity: UpdateOpportunitySchema) {
        const response = await api<unknown>("/current-organization/opportunity", {
            method: "PUT",
            body: JSON.stringify({ ...opportunity, opportunityId }),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }

}