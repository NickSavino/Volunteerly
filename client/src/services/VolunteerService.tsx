import { api } from "@/lib/api";
import { z } from "zod";
import {
    CurrentVolunteerSchema,
    OpportunitiesSchema,
    OpportunitySchema,
    type OpportunityFilters,
    type UpdateCurrentVolunteer,
    type ProgressUpdate,
    ExtractedSkills,
    ExtractedSkillsSchema,
    volunteerAwardsSchema
} from "@volunteerly/shared";
import { WorkExperience, Education } from "@/app/(protected)/(setup)/volunteer/experience-input/experienceInputVm";

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

    static async getOpportunityById(oppId: string) {
        const response = await api<unknown>(`/current-volunteer/opportunities/${oppId}`);
        return OpportunitySchema.safeParse(response);
    }

    static async addProgressUpdate(oppId: string, input: { title: string; description: string; hoursContributed: number }) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/progress`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    static async requestCompletion(oppId: string) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/request-completion`, {
            method: "POST",
        });
    }

    static async postReview(orgUserId: string, opportunityId: string, input: { rating: number }) {
        return api<{ success: boolean }>(`/current-volunteer/reviews`, {
            method: "POST",
            body: JSON.stringify({ revieweeId: orgUserId, opportunityId, ...input }),
        });
    }

    static async postFlag(flaggedUserId: string, reason: string) {
        return api<{ success: boolean }>(`/current-volunteer/flags`, {
            method: "POST",
            body: JSON.stringify({ flaggedUserId, reason }),
        });
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

    static async getAppliedOppIds(): Promise<string[]> {
        const response = await api<unknown>("/current-volunteer/opportunities/applied-ids");
        return Array.isArray(response) ? (response as string[]) : [];
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
    
    static async getVolAwards() {
        const response = await api<unknown>("/current-volunteer/awards");
        const parsed = volunteerAwardsSchema.safeParse(response)
        return parsed
    }

    static async logOppSkills(oppId: string, skills: string[]) {
        return api<{ success: boolean }>(`/current-volunteer/opportunities/${oppId}/skills`, {
            method: "POST",
            body: JSON.stringify({ skills }),
        });
    }

    static async getOppSkills(oppId: string): Promise<string[]> {
        const response = await api<unknown>(`/current-volunteer/opportunities/${oppId}/skills`);
        return Array.isArray(response) ? (response as string[]) : [];
    }

    static async extractSkills(
        resumeFile: File,
        workExperience: string,
        education: string
    ) {
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

    static async confirmSkills(
        skills: ExtractedSkills,
        workExperiences: WorkExperience[],
        educations: Education[]
    ) {
        const response = await api<{ success: boolean }>("/current-volunteer/extract-skills/confirm", {
            method: "POST",
            body: JSON.stringify({
                technical: skills.technical,
                nonTechnical: skills.nonTechnical,
                hourlyRate: skills.hourlyRate,
                workExperiences,
                educations,
            }),
        });
        return response;
    }

    static async backfillSkillVector() {
        return api<{ success: boolean; skipped?: boolean }>(
            "/current-volunteer/extract-skills/backfill",
            { method: "POST" }
        );
    }

}