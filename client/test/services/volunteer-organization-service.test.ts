jest.mock("@/lib/api", () => ({
    api: jest.fn(),
}));

import { api } from "@/lib/api";
import { VolunteerOrganizationService } from "@/services/VolunteerOrganizationService";
import { validPublicOrgProfileResponse } from "./fixtures";

const apiMockFn = api as jest.MockedFunction<typeof api>;

describe("VolunteerOrganizationService", () => {
    beforeEach(() => {
        apiMockFn.mockReset();
    });

    it("safe-parses public organization profile response", async () => {
        const response: unknown = validPublicOrgProfileResponse;
        apiMockFn.mockResolvedValueOnce(response);

        const result = await VolunteerOrganizationService.getPublicOrgProfile("org-id");

        expect(result.success).toBe(true);
        expect(apiMockFn).toHaveBeenCalledWith("/volunteer-organization/org-id");
    });
});
