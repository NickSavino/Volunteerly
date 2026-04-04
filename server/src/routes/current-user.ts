import { Router } from "express";
import { createCurrentUser, getCurrentUser, saveAvatar, updateCurrentUser } from "../services/user-service.js";
import multer from "multer";


export const currentUserRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only Images are allowed!"));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

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

currentUserRouter.post("/avatar", upload.single("image") ,async (req, res, next) => {
  try {
    const userId = req.auth!.userId;

    const avatar = req.file

    if (!avatar){
        return res.status(400).json({
            error: "No Image.",
            message: "Must Attach Image to Update Avatar."})
    }

    const avatarPath = await saveAvatar(userId, avatar)

    if (!avatarPath) {
        return res.status(500).json({
            error: "Error Saving Avatar.",
            message: "Error saving avatar to storage."})
    }

    res.status(200).json(avatarPath);
  } catch (error) {
    console.error(error);
    next(error);
    }
});