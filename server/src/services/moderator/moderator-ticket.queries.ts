import { Prisma } from "@prisma/client";
import { chatUserArgs } from "../helpers/prisma-shapes.js";

export const moderatorTicketDetailInclude = {
    include: {
        issuer: chatUserArgs,
        target: chatUserArgs,
        conversation: {
            include: {
                participants: {
                    include: {
                        user: chatUserArgs,
                    },
                },
                messages: {
                    orderBy: {
                        sentAt: "asc" as const,
                    },
                    include: {
                        sender: chatUserArgs,
                    },
                },
            },
        },
    },
} satisfies Prisma.TicketDefaultArgs;

export type ModeratorTicketDetailRecord = Prisma.TicketGetPayload<
    typeof moderatorTicketDetailInclude
>;
