const mockPrisma = {
    review: { aggregate: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    opportunity: {
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
    progressUpdate: {
        aggregate: jest.fn(),
        create: jest.fn(),
    },
};

jest.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));
jest.mock("../../src/lib/supabase.js", () => ({
    supabase: {
        storage: { from: () => ({ upload: jest.fn(), download: jest.fn() }) },
    },
}));
jest.mock("../../src/services/azure-service.js", () => ({ callDocumentAnalysis: jest.fn() }));
jest.mock("../../src/services/groq-service.js", () => ({ extractSkillsFromOpportunity: jest.fn() }));
jest.mock("../../src/services/gemini-service.js", () => ({ embedText: jest.fn() }));

import {
    completeOpportunity,
    getOpportunityAnalytics,
    getReviewSummary,
} from "../../src/services/organization-service.js";

describe("organization-service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns zero avg rating when aggregate avg is null", async () => {
        mockPrisma.review.aggregate.mockResolvedValueOnce({
            _avg: { rating: null },
            _count: { rating: 2 },
        });

        await expect(getReviewSummary("org-1")).resolves.toEqual({
            avgRating: 0,
            totalReviews: 2,
        });
    });

    it("throws when opportunity analytics cannot find opportunity", async () => {
        mockPrisma.opportunity.findFirst.mockResolvedValueOnce(null);
        await expect(getOpportunityAnalytics("org-1", "opp-1")).rejects.toThrow("Error getting Opportunity Analytics.");
    });

    it("creates completion progress update when org exists", async () => {
        mockPrisma.progressUpdate.aggregate.mockResolvedValueOnce({
            _sum: { hoursContributed: 7 },
        });
        mockPrisma.opportunity.update.mockResolvedValueOnce({ id: "opp-1", status: "CLOSED", hours: 7 });
        mockPrisma.opportunity.findUnique.mockResolvedValueOnce({ orgId: "org-1" });
        mockPrisma.progressUpdate.create.mockResolvedValueOnce({ id: "pu-1" });

        await completeOpportunity("opp-1");

        expect(mockPrisma.progressUpdate.create).toHaveBeenCalledWith({
            data: {
                opportunityId: "opp-1",
                senderId: "org-1",
                senderRole: "ORGANIZATION",
                title: "Opportunity Completed",
                description: "The organization has marked this opportunity as complete.",
                hoursContributed: 0,
            },
        });
    });
});
