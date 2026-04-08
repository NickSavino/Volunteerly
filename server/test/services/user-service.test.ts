jest.mock("@prisma/client", () => ({
  UserRole: {
    VOLUNTEER: "VOLUNTEER",
    ORGANIZATION: "ORGANIZATION",
    MODERATOR: "MODERATOR",
    ADMIN: "ADMIN",
  },
}));

const remove = jest.fn();
const deleteUser = jest.fn();

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));
jest.mock("../../src/lib/supabase.js", () => ({
  supabase: {
    storage: { from: () => ({ remove }) },
    auth: { admin: { deleteUser } },
  },
}));

import { createCurrentUser, deleteCurrentUser } from "../../src/services/user-service.js";

describe("user-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("defaults new users to VOLUNTEER role when userRole is empty", async () => {
    mockPrisma.user.create.mockResolvedValueOnce({ id: "u1", role: "VOLUNTEER" });

    await createCurrentUser("u1", "", "u1@example.com");

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        id: "u1",
        email: "u1@example.com",
        role: "VOLUNTEER",
      },
    });
  });

  it("throws when supabase auth deletion fails", async () => {
    const tx = {
      ticket: { updateMany: jest.fn().mockResolvedValue(undefined) },
      chatMessage: { updateMany: jest.fn().mockResolvedValue(undefined) },
      chatConversationParticipant: { deleteMany: jest.fn().mockResolvedValue(undefined) },
      moderator: { deleteMany: jest.fn().mockResolvedValue(undefined) },
    };

    mockPrisma.user.findUniqueOrThrow.mockResolvedValueOnce({
      id: "u1",
      email: "u1@example.com",
      role: "VOLUNTEER",
      volunteer: { firstName: "Jane", lastName: "Doe" },
      organization: null,
      moderator: null,
    });
    remove.mockResolvedValueOnce(undefined);
    mockPrisma.$transaction.mockImplementationOnce(
      async (callback: (context: typeof tx) => Promise<void>) => callback(tx),
    );
    deleteUser.mockResolvedValueOnce({ error: { message: "delete failed" } });

    await expect(deleteCurrentUser("u1")).rejects.toThrow("Failed to delete auth user: delete failed");
  });
});
