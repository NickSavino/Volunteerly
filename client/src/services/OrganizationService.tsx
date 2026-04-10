/**
 * OrganizationService.tsx
 * Client-side service for all organization-related API calls
 */

import { api } from "@/lib/api";
import {
    ApplicationSchema,
    ApplicationsSchema,
    CountSchema,
    CurrentOrganizationSchema,
    CurrentOrganizationUpdate,
    ModeratorOrganizationList,
    ModeratorOrganizationListSchema,
    OpportunitiesSchema,
    OpportunityAnalyticsSchema,
    OpportunitySchema,
    organizationAwardsSchema,
    OrganizationReviewStatsSchema,
    OrganizationSchema,
    ProgressUpdate,
    ProgressUpdateSchema,
    TotalHoursSchema,
    UpdateOpportunitySchema,
} from "@volunteerly/shared";

export class OrganizationService {
    /**
     * Gets the currently authenticated organization's profile
     * @returns Promise with parsed CurrentOrganization
     */
    static async getCurrentOrganization() {
        const response = await api<unknown>("/current-organization");
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    /**
     * Creates or updates the current organization's profile data
     * @param user - Updated organization data
     * @returns Promise with parsed CurrentOrganization
     */
    static async update_create_Organization(user: CurrentOrganizationUpdate) {
        const response = await api<unknown>("/current-organization", {
            method: "PUT",
            body: JSON.stringify(user),
        });
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    /**
     * Submits the organization's verification application with a supporting document
     * @param formData - Multipart form data including document file and org details
     * @returns Promise with parsed CurrentOrganization
     */
    static async apply(formData: FormData) {
        const response = await api<unknown>("/current-organization/apply", {
            method: "PUT",
            body: formData,
        });
        const parsed = CurrentOrganizationSchema.safeParse(response);
        return parsed;
    }

    /**
     * Fetches any earned awards for the current organization
     * @returns Promise with parsed awards record
     */
    static async getOrgAwards() {
        const response = await api<unknown>("/current-organization/awards");
        const parsed = organizationAwardsSchema.safeParse(response);
        return parsed;
    }

    /**
     * Fetches a list of all organizations, optionally filtered by status
     * @param status - Optional filter (ex. "APPLIED")
     * @returns Promise with a ModeratorOrganizationList
     */
    static async getAllOrganizations(status?: "APPLIED"): Promise<ModeratorOrganizationList> {
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

    /**
     * Downloads the verification document for a given file path
     * @param file_path - Storage path of the document to download
     * @returns Promise with a Blob of the file contents
     */
    static async getOrganizationDocument(file_path: string) {
        const url = `/organization/document/?file_path=${file_path}`;
        const response = await api<Blob>(url, { responseType: "blob" });
        return response;
    }

    /**
     * Approves an organization's application (moderator action)
     * @param orgId - ID of the organization to approve
     * @returns Promise with parsed Organization
     */
    static async approveOrganization(orgId: string) {
        const response = await api<unknown>("/organization/approve", {
            method: "PUT",
            body: JSON.stringify({ orgId }),
        });
        const parsed = OrganizationSchema.safeParse(response);
        return parsed;
    }

    /**
     * Rejects an organization's application with a reason (moderator action)
     * @param orgId - ID of the organization to reject
     * @param rejectionReason - Explanation shown to the organization
     * @returns Promise with parsed Organization
     */
    static async rejectOrganization(orgId: string, rejectionReason: string) {
        const response = await api<unknown>("/organization/reject", {
            method: "PUT",
            body: JSON.stringify({ orgId, rejectionReason }),
        });
        const parsed = OrganizationSchema.safeParse(response);
        return parsed;
    }

    /**
     * Fetches all opportunities posted by the current organization
     * @returns Promise with parsed Opportunities array
     */
    static async getAllOpportunities() {
        const response = await api<unknown>("/current-organization/opportunities");
        // API may return a single object instead of array - normalize it
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    /**
     * Fetches only active (OPEN or FILLED) opportunities for the current org
     * @returns Promise with parsed Opportunities array
     */
    static async getActiveOpportunities() {
        const response = await api<unknown>("/current-organization/opportunities/active");
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    /**
     * Gets the total count of all opportunities ever posted by this org
     * @returns Promise with parsed count
     */
    static async countAllOpportunities() {
        const response = await api<unknown>("/current-organization/opportunities/totalCount");
        const parsed = CountSchema.safeParse(response);
        return parsed;
    }

    /**
     * Gets the count of currently active (filled) volunteers for this org
     * @returns Promise with parsed count
     */
    static async countActiveVolunteers() {
        const response = await api<unknown>("/current-organization/opportunities/activeTotal");
        const parsed = CountSchema.safeParse(response);
        return parsed;
    }

    /**
     * Gets the total volunteer hours contributed across all opportunities
     * @returns Promise with parsed total hours
     */
    static async sumTotalHours() {
        const response = await api<unknown>("/current-organization/opportunities/hoursTotal");
        const parsed = TotalHoursSchema.safeParse(response);
        return parsed;
    }

    /**
     * Fetches the review summary (avg rating, total reviews) for this org
     * @returns Promise with parsed review stats
     */
    static async getReviewSummary() {
        const response = await api<unknown>("/current-organization/reviews");
        const parsed = OrganizationReviewStatsSchema.safeParse(response);
        return parsed;
    }

    /**
     * Fetches a single opportunity by ID (must belong to the current org)
     * @param oppId - ID of the opportunity to fetch
     * @returns Promise with parsed Opportunity
     */
    static async getOpportunity(oppId: string) {
        const url = `/current-organization/opportunity/?opp_id=${oppId}`;
        const response = await api<unknown>(url);
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }

    /**
     * Gets all applications for a given opportunity
     * @param oppId - ID of the opportunity
     * @returns Promise with parsed Applications array
     */
    static async getApplications(oppId: string) {
        const url = `/current-organization/opportunity/applications/?opp_id=${oppId}`;
        const response = await api<unknown>(url);
        const asArray = Array.isArray(response) ? response : [response];
        return ApplicationsSchema.safeParse(asArray);
    }

    /**
     * Gets a single application by ID
     * @param appId - ID of the application to fetch
     * @returns Promise with parsed Application
     */
    static async getApplication(appId: string) {
        const url = `/current-organization/opportunity/application/?app_id=${appId}`;
        const response = await api<unknown>(url);
        const parsed = ApplicationSchema.safeParse(response);
        return parsed;
    }

    /**
     * Selects a volunteer for an opportunity - marks the opportunity as FILLED
     * @param oppId - ID of the opportunity
     * @param vltId - ID of the volunteer to select
     * @returns Promise with parsed Opportunity
     */
    static async selectOppVolunteer(oppId: string, vltId: string) {
        const response = await api<unknown>("/current-organization/opportunity/select", {
            method: "PUT",
            body: JSON.stringify({ oppId, vltId }),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }

    /**
     * Marks an opportunity as completed (CLOSED)
     * @param oppId - ID of the opportunity to complete
     * @returns Promise with parsed Opportunity
     */
    static async completeOpportunity(oppId: string) {
        const response = await api<unknown>("/current-organization/opportunity/complete", {
            method: "PUT",
            body: JSON.stringify({ oppId }),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }

    /**
     * Gets analytics (hours and monetary value) for a completed opportunity
     * @param oppId - ID of the opportunity
     * @returns Promise with parsed analytics
     */
    static async getOpportunityAnalytics(oppId: string) {
        const url = `/current-organization/opportunity/analytics/?oppId=${oppId}`;
        const response = await api<unknown>(url);
        const parsed = OpportunityAnalyticsSchema.safeParse(response);
        return parsed;
    }

    /**
     * Adds a progress update to an in-progress opportunity
     * @param progressUpdate - Update data including title, description, and hours
     * @returns Promise with parsed ProgressUpdate
     */
    static async addProgressUpdate(progressUpdate: ProgressUpdate) {
        const response = await api<unknown>("/current-organization/opportunity/progressUpdate", {
            method: "POST",
            body: JSON.stringify(progressUpdate),
        });
        const parsed = ProgressUpdateSchema.safeParse(response);
        return parsed;
    }

    /**
     * Creates a new volunteer opportunity posting
     * @param opportunity - Full opportunity data
     * @returns Promise with parsed Opportunity
     */
    static async addOpportunity(opportunity: UpdateOpportunitySchema) {
        const response = await api<unknown>("/current-organization/opportunity", {
            method: "POST",
            body: JSON.stringify(opportunity),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }

    /**
     * Posts a star rating review for a volunteer after an opportunity
     * @param revieweeId - ID of the volunteer being reviewed
     * @param opportunityId - ID of the completed opportunity
     * @param rating - Numeric rating (1-5)
     * @returns Promise with success response
     */
    static async postReview(revieweeId: string, opportunityId: string, rating: number) {
        return api<{ success: boolean }>("/current-organization/reviews", {
            method: "POST",
            body: JSON.stringify({ revieweeId, opportunityId, rating }),
        });
    }

    /**
     * Flags a volunteer for problematic behavior after an opportunity
     * @param flaggedUserId - ID of the volunteer being flagged
     * @param opportunityId - ID of the opportunity where the issue occurred
     * @param reason - Description of why the volunteer is being flagged
     * @returns Promise with success response
     */
    static async postFlag(flaggedUserId: string, opportunityId: string, reason: string) {
        return api<{ success: boolean }>("/current-organization/flags", {
            method: "POST",
            body: JSON.stringify({ flaggedUserId, opportunityId, reason }),
        });
    }

    /**
     * Updates an existing opportunity's details
     * @param opportunityId - ID of the opportunity to update
     * @param opportunity - New opportunity data
     * @returns Promise with parsed Opportunity
     */
    static async updateOpportunity(opportunityId: string, opportunity: UpdateOpportunitySchema) {
        const response = await api<unknown>("/current-organization/opportunity", {
            method: "PUT",
            body: JSON.stringify({ ...opportunity, opportunityId }),
        });
        const parsed = OpportunitySchema.safeParse(response);
        return parsed;
    }
}
