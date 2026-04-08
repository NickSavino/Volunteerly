import { Router } from "express";
import { conversationsRouter } from "./conversations.routes.js";
import { auth } from "../../middleware/auth.js";

export const chatRouter = Router();

chatRouter.use("/", auth, conversationsRouter);
