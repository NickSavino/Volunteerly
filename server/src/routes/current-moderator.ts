import { Router } from "express";
import {
    createCurrentModerator,
    getCurrentModerator,
    updateCurrentModerator,
} from "../services/moderator-service.js";

export const currentModeratorRouter = Router();

currentModeratorRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

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

currentModeratorRouter.put("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

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