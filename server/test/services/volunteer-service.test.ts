const mockPrisma = {
    review: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
    },
    volunteer: {
        update: jest.fn(),
    },
    opportunity: {
        findMany: jest.fn(),
    },
    application: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    opportunitySkill: {
        findFirst: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
    },
};

jest.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

import {
    applyToOpportunity,
    getMonthlyHours,
    getVolunteerSkillCounts,
    logOpportunitySkills,
    postReview,
} from "../../src/services/volunteer-service.js";

describe("volunteer-service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("throws ALREADY_REVIEWED when duplicate review exists", async () => {
        mockPrisma.review.findUnique.mockResolvedValueOnce({ id: "existing-review" });

        await expect(postReview("issuer", "reviewee", "opp", { rating: 5 })).rejects.toThrow(
            "ALREADY_REVIEWED",
        );
        expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    it("buckets monthly hours by YYYY-MM", async () => {
        mockPrisma.opportunity.findMany.mockResolvedValueOnce([
            { hours: 2, postedDate: new Date("2026-01-10T00:00:00.000Z") },
            { hours: 3, postedDate: new Date("2026-01-20T00:00:00.000Z") },
            { hours: 4, postedDate: new Date("2026-02-05T00:00:00.000Z") },
        ]);

        await expect(getMonthlyHours("vol-1")).resolves.toEqual({
            "2026-01": 5,
            "2026-02": 4,
        });
    });

    it("returns counted skill frequency", async () => {
        mockPrisma.opportunitySkill.findMany.mockResolvedValueOnce([
            { skillName: "Communication" },
            { skillName: "Communication" },
            { skillName: "Leadership" },
        ]);

        await expect(getVolunteerSkillCounts("vol-1")).resolves.toEqual({
            Communication: 2,
            Leadership: 1,
        });
    });

    it("creates application when no duplicate exists", async () => {
        mockPrisma.application.findUnique.mockResolvedValueOnce(null);
        mockPrisma.application.create.mockResolvedValueOnce({ id: "app-1" });

        await applyToOpportunity("vol-1", "opp-1", "hello");

        expect(mockPrisma.application.create).toHaveBeenCalledWith({
            data: { oppId: "opp-1", volId: "vol-1", message: "hello", matchPercentage: 0 },
        });
    });

    it("no-ops logOpportunitySkills for empty skills", async () => {
        mockPrisma.opportunitySkill.findFirst.mockResolvedValueOnce(null);

        await logOpportunitySkills("vol-1", "opp-1", []);

        expect(mockPrisma.opportunitySkill.createMany).not.toHaveBeenCalled();
    });
});
