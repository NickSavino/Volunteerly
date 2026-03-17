import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
    createCurrentModerator,
    getCurrentModerator,
    updateCurrentModerator,
} from "../services/moderator-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    };
};

export const currentModeratorRouter = Router();

currentModeratorRouter.get("/", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;
        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }

        const moderator = await getCurrentModerator(userId);

        if (!moderator) {
            return res.status(404).json({
                error: "Not Found",
                message: "Moderator not found.",
            });
        }

        res.status(200).json(moderator);
    } catch (error) {
        next(error);
    }
});

currentModeratorRouter.put("/", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;
        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }

        const { firstName, lastName } = req.body;

        const moderator = await getCurrentModerator(userId);
        let modifiedModerator;

        if (!moderator) {
            modifiedModerator = await createCurrentModerator(userId, firstName, lastName);
        } else {
            modifiedModerator = await updateCurrentModerator(userId, firstName, lastName);
        }

        if (!modifiedModerator) {
            return res.status(500).json({
                error: "Cannot update/create Moderator",
                message: "Internal server error.",
            });
        }

        res.status(200).json(modifiedModerator);
    } catch (error) {
        console.error(error);
        next(error);
    }
});