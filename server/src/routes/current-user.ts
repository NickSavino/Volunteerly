import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createCurrentUser, getCurrentUser, updateCurrentUser } from "../services/user-service.js";

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

currentUserRouter.put("/", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }
    const { firstName, lastName, role, email } = req.body;

    const user = await getCurrentUser(userId);
    let modified_user;
    if (!user) {
        modified_user = await createCurrentUser(userId, firstName, lastName, role, email);
    } else {
        modified_user = await updateCurrentUser(userId, firstName, lastName, role, email);    
    }
    if (!modified_user) {
        return res.status(500).json({
            error: "Cannot update/create User",
            message: "Internal server error."
        });
    }

    res.status(200).json(modified_user);
  } catch (error) {
    console.error(error);
    next(error);
    }
});