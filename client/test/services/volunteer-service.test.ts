jest.mock("@/lib/api", () => ({ api: jest.fn() }));

import { api } from "@/lib/api";
import { VolunteerService } from "@/services/VolunteerService";
import { validOpportunityResponse } from "./fixtures";

const apiMock = api as jest.MockedFunction<typeof api>;

beforeEach(() => apiMock.mockReset());

describe("VolunteerService", () => {
    it("#7 getAppliedOppIds returns [] for non-array responses", async () => {
        const invalidResponse: unknown = { nope: true };
        apiMock.mockResolvedValueOnce(invalidResponse);
        await expect(VolunteerService.getAppliedOppIds()).resolves.toEqual([]);
    });

    it("#8 browseOpportunities serializes filters and parses single-item payload", async () => {
        const singleResponse: unknown = validOpportunityResponse;
        apiMock.mockResolvedValueOnce(singleResponse);

        const result = await VolunteerService.browseOpportunities({
            search: "food",
            workType: "REMOTE",
            maxHours: 5,
        });

        expect(apiMock).toHaveBeenCalledWith(
            "/current-volunteer/opportunities/browse?search=food&workType=REMOTE&maxHours=5",
        );
        expect(result.success).toBe(true);
    });

    it("#9 getOpportunityMatchScores returns {} when api throws", async () => {
        apiMock.mockRejectedValueOnce(new Error("network"));
        await expect(VolunteerService.getOpportunityMatchScores()).resolves.toEqual({});
    });
});
