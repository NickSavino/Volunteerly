import { Router } from "express";
import { moderatorVolunteersRouter } from "./moderator-volunteer.routes.js";
import { moderatorTicketsRouter } from "./moderator-ticket.routes.js";

export const moderatorRouter = Router();

moderatorRouter.use("/volunteers", moderatorVolunteersRouter);
moderatorRouter.use("/tickets", moderatorTicketsRouter);
