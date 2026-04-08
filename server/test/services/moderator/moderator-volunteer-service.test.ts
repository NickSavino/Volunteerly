const mockPrisma = {
    volunteer: {
        findMany: jest.fn(),
    },
};

jest.mock("../../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

import { getModeratorVolunteerList } from "../../../src/services/moderator/moderator-volunteer-service.js";

describe("moderator-volunteer-service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("maps volunteer list and derives reporter display name", async () => {
        mockPrisma.volunteer.findMany.mockResolvedValueOnce([
            {
                id: "123e4567-e89b-12d3-a456-426614174000",
                firstName: "Jane",
                lastName: "Doe",
                location: "Calgary",
                organizationsAssisted: 3,
                averageRating: 4.5,
                status: "FLAGGED",
                user: {
                    reportsReceived: [
                        {
                            isOpen: true,
                            reason: "Abuse",
                            reportingUser: {
                                email: "org@example.com",
                                organization: { orgName: "Org One" },
                                volunteer: null,
                                moderator: null,
                            },
                        },
                    ],
                },
            },
        ]);

        const result = await getModeratorVolunteerList();

        expect(result[0]).toEqual({
            id: "123e4567-e89b-12d3-a456-426614174000",
            firstName: "Jane",
            lastName: "Doe",
            location: "Calgary",
            flaggedByDisplayName: "Org One",
            latestFlagReason: "Abuse",
            pastFlagsCount: 1,
            completedOpportunities: 3,
            averageRating: 4.5,
            state: "FLAGGED",
        });
    });
});
