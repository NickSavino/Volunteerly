/**
 * VolunteerService.tsx
 * Client-side service for all volunteer-related API calls. Wraps the /current-volunteer endpoints
 */
import { api } from "@/lib/api";
import { z } from "zod";
import {
    CurrentVolunteerSchema,
    OpportunitiesSchema,
    OpportunitySchema,
    type OpportunityFilters,
    type UpdateCurrentVolunteer,
    ExtractedSkills,
    ExtractedSkillsSchema,
    volunteerAwardsSchema,
} from "@volunteerly/shared";
import {
    WorkExperience,
    Education,
} from "@/app/(protected)/(setup)/volunteer/experience-input/experienceInputVm";

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
    /**
     * Fetches the current volunteer's profile
     * @returns SafeParseReturnType with CurrentVolunteer data
     */
    static async getCurrentVolunteer() {
        const response = await api<unknown>("/current-volunteer");
        return CurrentVolunteerSchema.safeParse(response);
    }

    /**
     * Updates or creates the current volunteer's profile fields
     * @param user - the fields to update
     * @returns SafeParseReturnType with the updated CurrentVolunteer
     */
    static async update_create_Volunteer(user: UpdateCurrentVolunteer) {
        const response = await api<unknown>("/current-volunteer", {
            method: "PUT",
            body: JSON.stringify(user),
        });
        return CurrentVolunteerSchema.safeParse(response);
    }

    /**
     * Fetches the volunteer's assigned (FILLED or CLOSED) opportunities for the dashboard
     * @returns SafeParseReturnType with an array of Opportunity
     */
    static async getYourOpportunities() {
        const response = await api<unknown>("/current-volunteer/opportunities");
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    /**
     * Fetches a single opportunity by ID for the detail page
     * @param oppId - the opportunity's UUID
     * @returns SafeParseReturnType with the Opportunity
     */
    static async getOpportunityById(oppId: string) {
        const response = await api<unknown>(`/current-volunteer/opportunities/${oppId}`);
        return OpportunitySchema.safeParse(response);
    }

    /**
     * Adds a progress update to an active opportunity
     * @param oppId - the opportunity to update
     * @param input - title, description, and hours contributed
     * @returns success flag
     */
    static async addProgressUpdate(
        oppId: string,
        input: { title: string; description: string; hoursContributed: number },
    ) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/progress`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    /**
     * Requests the organization to mark an opportunity as complete
     * @param oppId - the opportunity to request completion for
     * @returns success flag
     */
    static async requestCompletion(oppId: string) {
        return api<{ success: boolean }>(
            `/current-volunteer/opportunities/${oppId}/request-completion`,
            {
                method: "POST",
            },
        );
    }

    /**
     * Posts a star rating review for an organization after completing an opportunity
     * @param orgUserId - the organization's user ID
     * @param opportunityId - the opportunity the review is for
     * @param input - rating (1–5)
     * @returns success flag
     */
    static async postReview(orgUserId: string, opportunityId: string, input: { rating: number }) {
        return api<{ success: boolean }>(`/current-volunteer/reviews`, {
            method: "POST",
            body: JSON.stringify({ revieweeId: orgUserId, opportunityId, ...input }),
        });
    }

    /**
     * Flags an organization for review by the moderation team
     * @param flaggedUserId - the organization's user ID
     * @param opportunityId - the opportunity context for the flag
     * @param reason - the volunteer's stated reason for flagging
     * @returns success flag
     */
    static async postFlag(flaggedUserId: string, opportunityId: string, reason: string) {
        return api<{ success: boolean }>(`/current-volunteer/flags`, {
            method: "POST",
            body: JSON.stringify({ flaggedUserId, opportunityId, reason }),
        });
    }

    /**
     * Fetches the list of organizations the volunteer has worked with
     * @returns SafeParseReturnType with an array of PartnerOrg
     */
    static async getVolunteerOrganizations() {
        const response = await api<unknown>("/current-volunteer/organizations");
        const asArray = Array.isArray(response) ? response : [response];
        return PartnerOrgsSchema.safeParse(asArray);
    }

    /**
     * Fetches monthly hours data for the contribution chart on the dashboard
     * @returns SafeParseReturnType with a Record of "YYYY-MM" → hours
     */
    static async getMonthlyHours() {
        const response = await api<unknown>("/current-volunteer/monthly-hours");
        return MonthlyHoursSchema.safeParse(response);
    }

    /**
     * Gets the IDs of all opportunities the volunteer has already applied to
     * Used to show the Applied badge on opportunity cards
     * @returns array of opportunity UUIDs
     */
    static async getAppliedOppIds(): Promise<string[]> {
        const response = await api<unknown>("/current-volunteer/opportunities/applied-ids");
        return Array.isArray(response) ? (response as string[]) : [];
    }

    /**
     * Submits an application to an open opportunity
     * @param oppId - the opportunity to apply to
     * @param message - the volunteer's cover message to the organization
     * @returns success flag
     */
    static async applyToOpportunity(oppId: string, message: string) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/apply`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    }

    /**
     * Fetches all open opportunities, optionally filtered by search, type, commitment, and hours
     * @param filters - optional filters to narrow the results
     * @returns SafeParseReturnType with an array of Opportunity
     */
    static async browseOpportunities(filters: OpportunityFilters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category) params.set("category", filters.category);
        if (filters.workType) params.set("workType", filters.workType);
        if (filters.commitmentLevel) params.set("commitmentLevel", filters.commitmentLevel);
        if (filters.maxHours !== undefined) params.set("maxHours", String(filters.maxHours));

        const query = params.toString();
        const response = await api<unknown>(
            `/current-volunteer/opportunities/browse${query ? `?${query}` : ""}`,
        );
        const asArray = Array.isArray(response) ? response : [response];
        return OpportunitiesSchema.safeParse(asArray);
    }

    /**
     * Fetches the volunteer's earned milestone awards
     * @returns SafeParseReturnType with a Record of award title and description
     */
    static async getVolAwards() {
        const response = await api<unknown>("/current-volunteer/awards");
        const parsed = volunteerAwardsSchema.safeParse(response);
        return parsed;
    }

    /**
     * Logs the skills gained from completing an opportunity (used for the skill tree)
     * @param oppId - the completed opportunity
     * @param skills - array of skill names to log
     * @returns success flag
     */
    static async logOppSkills(oppId: string, skills: string[]) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/skills`, {
            method: "POST",
            body: JSON.stringify({ skills }),
        });
    }

    /**
     * Fetches the skills a volunteer logged for a specific opportunity
     * @param oppId - the opportunity to fetch skills for
     * @returns array of skill name strings
     */
    static async getOppSkills(oppId: string): Promise<string[]> {
        const response = await api<unknown>(`/current-volunteer/opportunities/${oppId}/skills`);
        return Array.isArray(response) ? (response as string[]) : [];
    }

    /**
     * Uploads a resume PDF plus work/education text to have Groq extract skills and estimate hourly rate
     * @param resumeFile - the PDF file to parse
     * @param workExperience - formatted work history text
     * @param education - formatted education text
     * @returns SafeParseReturnType with ExtractedSkills (technical, nonTechnical, hourlyRate)
     */
    static async extractSkills(resumeFile: File, workExperience: string, education: string) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        if (workExperience) formData.append("workExperience", workExperience);
        if (education) formData.append("education", education);

        const response = await api<unknown>("/current-volunteer/extract-skills", {
            method: "POST",
            body: formData,
        });
        return ExtractedSkillsSchema.safeParse(response);
    }

    /**
     * Confirms the extracted skills and saves work experience, education, hourly rate,
     * the Gemini skill vector, and marks the volunteer as VERIFIED
     * @param skills - the confirmed extracted skills including hourlyRate
     * @param workExperiences - the work experience entries from the form
     * @param educations - the education entries from the form
     * @returns success flag
     */
    static async confirmSkills(
        skills: ExtractedSkills,
        workExperiences: WorkExperience[],
        educations: Education[],
    ) {
        const response = await api<{ success: boolean }>(
            "/current-volunteer/extract-skills/confirm",
            {
                method: "POST",
                body: JSON.stringify({
                    technical: skills.technical,
                    nonTechnical: skills.nonTechnical,
                    hourlyRate: skills.hourlyRate,
                    workExperiences,
                    educations,
                }),
            },
        );
        return response;
    }

    /**
     * Triggers a server-side backfill of the skill vector for seeded/legacy volunteers
     * who have a skill profile but no vector yet - called silently on dashboard load
     * @returns success flag or skipped flag if no profile exists
     */
    static async backfillSkillVector() {
        return api<{ success: boolean; skipped?: boolean }>(
            "/current-volunteer/extract-skills/backfill",
            {
                method: "POST",
            },
        );
    }

    /**
     * Triggers a server-side backfill of skill vectors for opportunities that don't have one yet
     * Fire-and-forget - called on the opportunities page load, errors are swallowed
     * @returns success flag with optional count of backfilled records
     */
    static async backfillOpportunityVectors() {
        return api<{ success: boolean; skipped?: boolean; count?: number }>(
            "/current-volunteer/opportunities/backfill-vectors",
            { method: "POST" },
        ).catch(() => {});
    }

    /**
     * Fetches cosine similarity match scores between the volunteer's skill vector
     * and all open opportunity skill vectors
     * Returns empty object if the volunteer has no vector yet (they see 1% defaults)
     * @returns Record of oppId -> match percentage (1–100)
     */
    static async getOpportunityMatchScores(): Promise<Record<string, number>> {
        try {
            const response = await api<Record<string, number>>(
                "/current-volunteer/opportunities/match-scores",
            );
            return response ?? {};
        } catch {
            return {};
        }
    }
}
