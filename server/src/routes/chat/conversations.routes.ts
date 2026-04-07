import { Router } from "express";
import { createChatMessage, getChatConversationDetail, getChatConversationList } from "../../services/chat/chat-service.js";
import { CreateChatMessageSchema } from "@volunteerly/shared";


export const conversationsRouter = Router();

conversationsRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId

        const conversations = await getChatConversationList(userId);

        return res.status(200).json(conversations);
    } catch (error) {
        next(error);
    }
});

conversationsRouter.get("/:conversationId", async (req, res, next) => {
    try {
        const userId = req.auth!.userId

        const conversation = await getChatConversationDetail(
            userId,
            req.params.conversationId
        );

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
            parsed.data.content
        );

        if (!message) {
            return res.status(404).json({
                error: "Not Found",
                message: "Conversation not found or user is not a participant.",
            });
        }

        return res.status(201).json(message)
    } catch (error) {
        next(error);
    }
})