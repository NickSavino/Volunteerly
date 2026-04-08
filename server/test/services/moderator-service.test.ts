const mockPrisma = {
  moderator: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

import {
  createCurrentModerator,
  getModeratorDashboardSummary,
} from "../../src/services/moderator-service.js";

describe("moderator-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an empty dashboard summary structure", async () => {
    await expect(getModeratorDashboardSummary()).resolves.toEqual({
      pendingOrganizationsCount: 0,
      flaggedAccountsCount: 0,
      openTicketsCount: 0,
      recentPendingOrganizations: [],
      recentFlaggedAccounts: [],
      recentTickets: [],
    });
  });

  it("creates moderator using provided names", async () => {
    mockPrisma.moderator.create.mockResolvedValueOnce({
      id: "m1",
      firstName: "Mod",
      lastName: "Erator",
    });

    await createCurrentModerator("m1", "Mod", "Erator");

    expect(mockPrisma.moderator.create).toHaveBeenCalledWith({
      data: {
        id: "m1",
        firstName: "Mod",
        lastName: "Erator",
      },
    });
  });
});
