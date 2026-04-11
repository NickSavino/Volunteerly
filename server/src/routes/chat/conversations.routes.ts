/**
 * conversations.routes.ts
 * Handles chat conversation listing, detail retrieval, and message creation routes.
 */

import { CreateChatMessageSchema } from "@volunteerly/shared";
import { Router } from "express";
import {
    createChatMessage,
    getChatConversationDetail,
    getChatConversationList,
} from "../../services/chat/chat-service.js";

export const conversationsRouter = Router();

/**
 * GET /chat
 * Fetches all chat conversations for the authenticated user.
 * Auth: required (MODERATOR, VOLUNTEER, ORGANIZATION)
 * Params: none
 * Body: none
 * Returns: 200 with ChatConversationList
 * Errors: 401, 500
 */
conversationsRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const conversations = await getChatConversationList(userId);

        return res.status(200).json(conversations);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /chat/:conversationId
 * Fetches a single chat conversation if the authenticated user is a participant.
 * Auth: required (MODERATOR, VOLUNTEER, ORGANIZATION)
 * Params: conversationId
 * Body: none
 * Returns: 200 with ChatConversationDetail
 * Errors: 401, 404, 500
 */
conversationsRouter.get("/:conversationId", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const conversation = await getChatConversationDetail(userId, req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({
                error: "Not Found",
                message: "Conversation not found.",
            });
        }

        return res.status(200).json(conversation);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /chat/:conversationId/messages
 * Creates a new message in a conversation the authenticated user participates in.
 * Auth: required (MODERATOR, VOLUNTEER, ORGANIZATION)
 * Params: conversationId
 * Body: { content }
 * Returns: 201 with ChatMessage
 * Errors: 400, 401, 404, 409, 500
 */
conversationsRouter.post("/:conversationId/messages", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const parsed = CreateChatMessageSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Invalid message payload.",
                details: parsed.error.flatten(),
            });
        }

        const message = await createChatMessage(
            userId,
            req.params.conversationId,
            parsed.data.content,
        );

        if (!message) {
            return res.status(404).json({
                error: "Not Found",
                message: "Conversation not found or user is not a participant.",
            });
        }

        return res.status(201).json(message);
    } catch (error: any) {
        if (error?.message === "TICKET_CLOSED") {
            return res.status(409).json({
                error: "Conflict",
                message: "This ticket is closed. Replies are disabled.",
            });
        }

        next(error);
    }
});
