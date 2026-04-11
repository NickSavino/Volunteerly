/**
 * prisma-shapes.ts
 * Defines reusable Prisma select shapes and payload types for service queries.
 */

import { Prisma } from "@prisma/client";

export const chatUserArgs = {
    select: {
        id: true,
        email: true,
        role: true,
        volunteer: {
            select: {
                firstName: true,
                lastName: true,
            },
        },
        organization: {
            select: {
                orgName: true,
            },
        },
        moderator: {
            select: {
                firstName: true,
                lastName: true,
            },
        },
    },
} satisfies Prisma.UserDefaultArgs;

export type ChatUserRecord = Prisma.UserGetPayload<typeof chatUserArgs>;
