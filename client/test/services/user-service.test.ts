jest.mock("@/lib/api", () => ({
    api: jest.fn(),
}));

jest.mock("@/lib/supabase", () => ({
    supabase: {
        storage: {
            from: () => ({
                getPublicUrl: () => ({
                    data: { publicUrl: "https://cdn.example/avatar.jpeg" },
                }),
            }),
        },
    },
}));

import { api } from "@/lib/api";
import { UserService } from "@/services/UserService";
import { validCurrentUserResponse } from "./fixtures";

const apiMockFn = api as jest.MockedFunction<typeof api>;

describe("UserService", () => {
    beforeEach(() => {
        apiMockFn.mockReset();
    });

    it("safe-parses getCurrentUser response", async () => {
        const response: unknown = validCurrentUserResponse;
        apiMockFn.mockResolvedValueOnce(response);

        const result = await UserService.getCurrentUser();

        expect(result.success).toBe(true);
        expect(apiMockFn).toHaveBeenCalledWith("/current-user");
    });

    it("returns undefined when getAvatarURL is called without user id", () => {
        expect(UserService.getAvatarURL()).toBeUndefined();
    });

    it("appends cache-busting version for avatar URL", () => {
        expect(UserService.getAvatarURL("user-1", 7)).toBe("https://cdn.example/avatar.jpeg?v=7");
    });
});
