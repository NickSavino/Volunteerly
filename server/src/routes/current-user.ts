import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { getCurrentUser } from "../services/user-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    }
}

export const currentUserRouter = Router();

currentUserRouter.get("/", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing."
            });
        }

        const user = await getCurrentUser(userId);
        
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "Application User not found."
            });
        }
       

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
})