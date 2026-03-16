import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getModeratorDashboardSummary } from "../services/moderator-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    };
};

export const moderatorRouter = Router();

moderatorRouter.get("/dashboard", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }

        const summary = await getModeratorDashboardSummary();
        res.status(200).json(summary);
    } catch (error) {
        next(error);
    }
});