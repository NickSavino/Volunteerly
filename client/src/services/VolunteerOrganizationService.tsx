/**
 * VolunteerOrganizationService.tsx
 * Client-side service for volunteer-facing organization API calls
 */
import { api } from "@/lib/api";
import { PublicOrgProfileSchema } from "@volunteerly/shared";

export class VolunteerOrganizationService {
    /**
     * Fetches the public profile for a given organization and validates the response shape
     * Uses Zod's safeParse so the caller can check result.success without throwing
     * @param orgId - the organization's ID
     * @returns a Zod SafeParseReturnType containing a PublicOrgProfile on success
     */
    static async getPublicOrgProfile(orgId: string) {
        const response = await api<unknown>(`/volunteer-organization/${orgId}`);
        return PublicOrgProfileSchema.safeParse(response);
    }
}
