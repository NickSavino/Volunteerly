jest.mock("@/lib/api", () => ({
  api: jest.fn(),
}));

import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";
import { validModeratorOrganizationListItemResponse } from "./fixtures";

const apiMockFn = api as jest.MockedFunction<typeof api>;

describe("OrganizationService", () => {
  beforeEach(() => {
    apiMockFn.mockReset();
  });

  it("returns parsed organizations for getAllOrganizations", async () => {
    const response: unknown = [validModeratorOrganizationListItemResponse];
    apiMockFn.mockResolvedValueOnce(response);

    const result = await OrganizationService.getAllOrganizations("APPLIED");

    expect(result).toHaveLength(1);
    expect(apiMockFn).toHaveBeenCalledWith("/organization?status=APPLIED");
  });

  it("throws when getAllOrganizations parsing fails", async () => {
    const response: unknown = [{ id: "not-a-uuid" }];
    apiMockFn.mockResolvedValueOnce(response);

    await expect(OrganizationService.getAllOrganizations()).rejects.toThrow("Error fetching organizations.");
  });
});
