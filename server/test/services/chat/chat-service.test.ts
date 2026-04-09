const mockPrisma = {
    chatConversation: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
};

jest.mock("../../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

import {
    createChatMessage,
    getChatConversationList,
} from "../../../src/services/chat/chat-service.js";

describe("chat-service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("maps chat conversation list with other participant and preview", async () => {
        mockPrisma.chatConversation.findMany.mockResolvedValueOnce([
            {
                id: "conv-1",
                kind: "DIRECT",
                ticketId: null,
                ticket: null,
                participants: [
                    {
                        userId: "self",
                        user: {
                            id: "self",
                            email: "self@example.com",
                            role: "VOLUNTEER",
                            volunteer: { firstName: "Self", lastName: "User" },
                            organization: null,
                            moderator: null,
                        },
                    },
                    {
                        userId: "other",
                        user: {
                            id: "other",
                            email: "other@example.com",
                            role: "VOLUNTEER",
                            volunteer: { firstName: "Other", lastName: "User" },
                            organization: null,
                            moderator: null,
                        },
                    },
                ],
                messages: [{ content: "hello" }],
                lastMessageAt: new Date("2026-01-01T00:00:00.000Z"),
            },
        ]);

        const result = await getChatConversationList("self");

        expect(result).toHaveLength(1);
        expect(result[0].otherParticipant?.displayName).toBe("Other User");
        expect(result[0].lastMessagePreview).toBe("hello");
    });

    it("returns null when creating a message for a non-participant", async () => {
        mockPrisma.chatConversation.findFirst.mockResolvedValueOnce(null);

        await expect(createChatMessage("u1", "conv-1", "hi")).resolves.toBeNull();
        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
});
