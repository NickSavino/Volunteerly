import { Router } from "express";
import { getModeratorTicketList } from "../../services/moderator/moderator-ticket-service.js";


export const moderatorTicketsRouter = Router();

moderatorTicketsRouter.get("/", async (_, res, next) => {
    try {
        
        const tickets = await getModeratorTicketList();

        res.status(200).json(tickets);
    } catch (error) {
        next(error);
    }
});