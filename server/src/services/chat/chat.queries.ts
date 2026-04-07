import { Prisma } from "@prisma/client";
import { chatUserArgs } from "../helpers/prisma-shapes.js";


export const chatMessageWithSenderArgs = {
    include: {
        sender: chatUserArgs,
    },
} satisfies Prisma.ChatMessageDefaultArgs;

export type ChatMessageRecord = Prisma.ChatMessageGetPayload<
    typeof chatMessageWithSenderArgs
>;

export const chatConversationListArgs = {
    include: {
        ticket: {
            select: {
                id: true,
                title: true,
            },
        },
        participants: {
            include: {
                user: chatUserArgs,
            },
        },
        messages: {
            orderBy: {
                sentAt: "desc" as const,
            },
            take: 1,
        },
    },
} satisfies Prisma.ChatConversationDefaultArgs;

export type ChatConversationListRecord = Prisma.ChatConversationGetPayload<
    typeof chatConversationListArgs
>;

export const chatConversationDetailArgs = {
    include: {
        ticket: {
            select: {
                id: true,
                title: true,
            },
        },
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
} satisfies Prisma.ChatConversationDefaultArgs;

export type ChatConversationDetailRecord = Prisma.ChatConversationGetPayload<
    typeof chatConversationDetailArgs
>;