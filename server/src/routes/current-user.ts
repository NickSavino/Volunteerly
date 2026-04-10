/**
 * current-user.ts
 * Routes for the authenticated user's own profile and avatar
 */

import { Router } from "express";
import {
    createCurrentUser,
    deleteCurrentUser,
    getCurrentUser,
    saveAvatar,
    updateCurrentUser,
} from "../services/user-service.js";
import multer from "multer";

export const currentUserRouter = Router();

// Keep uploaded images in memory - passed directly to Supabase storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only Images are allowed!"));
        }

        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
});

/**
 * GET /current-user
 * Returns the authenticated user's application profile.
 * Auth: required
 * Returns: 200 with user data
 * Errors: 401, 404, 500
 */
currentUserRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const user = await getCurrentUser(userId);

        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "Application User not found.",
            });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /current-user
 * Creates or updates the current user's profile (role and email).
 * Used during signup to set up the app-level user record after Supabase auth.
 * Auth: required
 * Body: role, email
 * Returns: 200 with user data
 * Errors: 401, 500
 */
currentUserRouter.put("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const { role, email } = req.body;

        // Decide between create (new user) vs. update (existing user)
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
                message: "Internal server error.",
            });
        }

        res.status(200).json(modified_user);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * DELETE /current-user
 * Deletes the authenticated user's account and all associated data.
 * Auth: required
 * Returns: 204 no content
 * Errors: 401, 500
 */
currentUserRouter.delete("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        await deleteCurrentUser(userId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-user/avatar
 * Uploads a new avatar image for the authenticated user.
 * Auth: required
 * Body: multipart/form-data with "image" field
 * Returns: 200 with the storage path of the saved avatar
 * Errors: 400 (no image), 401, 500
 */
currentUserRouter.post("/avatar", upload.single("image"), async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const avatar = req.file;

        if (!avatar) {
            return res.status(400).json({
                error: "No Image.",
                message: "Must Attach Image to Update Avatar.",
            });
        }

        const avatarPath = await saveAvatar(userId, avatar);

        if (!avatarPath) {
            return res.status(500).json({
                error: "Error Saving Avatar.",
                message: "Error saving avatar to storage.",
            });
        }

        res.status(200).json(avatarPath);
    } catch (error) {
        console.error(error);
        next(error);
    }
});