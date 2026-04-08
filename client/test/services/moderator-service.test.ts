jest.mock("@/lib/api", () => ({
    api: jest.fn(),
}));

import { api } from "@/lib/api";
import { ModeratorService } from "@/services/ModeratorService";
import {
    validCurrentModeratorResponse,
    validModeratorTicketResponse,
    validModeratorVolunteerResponse,
} from "./fixtures";

const apiMockFn = api as jest.MockedFunction<typeof api>;

describe("ModeratorService", () => {
    beforeEach(() => {
        apiMockFn.mockReset();
    });

    it("safe-parses getCurrentModerator response", async () => {
        const response: unknown = validCurrentModeratorResponse;
        apiMockFn.mockResolvedValueOnce(response);

        const result = await ModeratorService.getCurrentModerator();

        expect(result.success).toBe(true);
        expect(apiMockFn).toHaveBeenCalledWith("/current-moderator");
    });

    it("returns typed ticket list for getModeratorTickets", async () => {
        const response: unknown = [validModeratorTicketResponse];
        apiMockFn.mockResolvedValueOnce(response);

        await expect(ModeratorService.getModeratorTickets()).resolves.toHaveLength(1);
    });

    it("throws when volunteer list parsing fails", async () => {
        const response: unknown = [validModeratorVolunteerResponse, { id: "bad-uuid" }];
        apiMockFn.mockResolvedValueOnce(response);

        await expect(ModeratorService.getModeratorVolunteers()).rejects.toThrow("Error fetching volunteers.");
    });
});
