import { Router } from "express";
import { createCurrentUser, getCurrentUser, updateCurrentUser } from "../services/user-service.js";


export const currentUserRouter = Router();

currentUserRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

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

currentUserRouter.put("/", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;

    const {role, email} = req.body;

    const user = await getCurrentUser(userId);
    let modified_user;
    if (!user) {
        modified_user = await createCurrentUser(userId, role, email);
    } else {
        modified_user = await updateCurrentUser(userId, role, email);    
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