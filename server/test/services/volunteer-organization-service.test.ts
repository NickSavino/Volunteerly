const mockPrisma = {
    organization: { findUnique: jest.fn() },
    application: { count: jest.fn() },
    opportunity: { count: jest.fn() },
    review: { findMany: jest.fn() },
};

jest.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

import { getPublicOrgProfile } from "../../src/services/volunteer-organization-service.js";

describe("volunteer-organization-service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns null when organization does not exist", async () => {
        mockPrisma.organization.findUnique.mockResolvedValueOnce(null);
        await expect(getPublicOrgProfile("org-1")).resolves.toBeNull();
    });

    it("maps profile and filters impact highlights", async () => {
        mockPrisma.organization.findUnique.mockResolvedValueOnce({
            id: "org-1",
            orgName: "Org",
            missionStatement: "m",
            causeCategory: "c",
            website: "w",
            hqAdr: "h",
            impactHighlights: [{ label: "A", value: 10 }, { bad: true }, { label: "B", value: 20 }],
        });
        mockPrisma.application.count.mockResolvedValueOnce(8);
        mockPrisma.opportunity.count.mockResolvedValueOnce(3);
        mockPrisma.review.findMany.mockResolvedValueOnce([{ rating: 4 }, { rating: 2 }]);

        const result = await getPublicOrgProfile("org-1");

        expect(result?.impactHighlights).toEqual([
            { label: "A", value: 10 },
            { label: "B", value: 20 },
        ]);
        expect(result?.averageRating).toBe(3);
        expect(result?.reviewCount).toBe(2);
    });
});
