const mockPrisma = {
  ticket: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock("../../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

import {
  getModeratorTicketDetail,
  getModeratorTicketList,
} from "../../../src/services/moderator/moderator-ticket-service.js";

describe("moderator-ticket-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps ticket list to DTO strings and optional target", async () => {
    mockPrisma.ticket.findMany.mockResolvedValueOnce([
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Issue",
        description: "desc",
        status: "OPEN",
        category: "BUG",
        urgencyRating: "MINOR",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        issuerId: "123e4567-e89b-12d3-a456-426614174001",
        targetId: null,
      },
    ]);

    const result = await getModeratorTicketList();

    expect(result[0].targetId).toBeUndefined();
    expect(result[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns null detail when ticket is missing", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null);
    await expect(getModeratorTicketDetail("ticket-1")).resolves.toBeNull();
  });
});
