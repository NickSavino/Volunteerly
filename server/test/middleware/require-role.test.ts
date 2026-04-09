jest.mock("@prisma/client", () => ({
    UserRole: {
        VOLUNTEER: "VOLUNTEER",
        ORGANIZATION: "ORGANIZATION",
        MODERATOR: "MODERATOR",
        ADMIN: "ADMIN",
    },
}));

jest.mock("../../src/lib/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

import { prisma } from "../../src/lib/prisma.js";
import { requireRole } from "../../src/middleware/require-role.js";
import type { NextFunction, Request, Response } from "express";

const mockedFindUnique = prisma.user.findUnique as jest.MockedFunction<
    typeof prisma.user.findUnique
>;
type MockResponse = Pick<Response, "status" | "json">;
type MockRequest = {
    auth?: {
        userId: string;
        email?: string;
    };
};

function createRes(): MockResponse {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
}

describe("requireRole", () => {
    beforeEach(() => {
        mockedFindUnique.mockReset();
    });

    it("returns 403 when the user role is not allowed", async () => {
        mockedFindUnique.mockResolvedValue({ role: "VOLUNTEER" });

        const req: MockRequest = { auth: { userId: "user-1" } };
        const res = createRes();
        const next: NextFunction = jest.fn();

        await requireRole("MODERATOR")(req as Request, res as Response, next);

        expect(mockedFindUnique).toHaveBeenCalledWith({
            where: { id: "user-1" },
            select: { role: true },
        });
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Forbidden",
            message: "Insufficient Permissions",
        });
        expect(next).not.toHaveBeenCalled();
    });
});
