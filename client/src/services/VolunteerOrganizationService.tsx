import { api } from "@/lib/api";
import { PublicOrgProfileSchema } from "@volunteerly/shared";

export class VolunteerOrganizationService {

    static async getPublicOrgProfile(orgId: string) {
        const response = await api<unknown>(`/volunteer-organization/${orgId}`);
        return PublicOrgProfileSchema.safeParse(response);
    }
}