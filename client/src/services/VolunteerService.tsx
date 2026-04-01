import { api } from "@/lib/api";
import { z } from "zod";
import {
    CurrentVolunteerSchema,
    UpdateCurrentVolunteer,
    OpportunitiesSchema,
    OrganizationSchema,
    ExtractedSkills,
    ExtractedSkillsSchema,
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

    static async confirmSkills(skills: ExtractedSkills) {
        const response = await api<{ success: boolean }>("/current-volunteer/extract-skills/confirm", {
            method: "POST",
            body: JSON.stringify(skills),
        });
        return response;
    }
}