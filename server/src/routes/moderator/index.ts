import { Router } from "express";
import { moderatorVolunteersRouter } from "./moderator-volunteer.routes.js";



export const moderatorRouter = Router();

moderatorRouter.use("/volunteers", moderatorVolunteersRouter);