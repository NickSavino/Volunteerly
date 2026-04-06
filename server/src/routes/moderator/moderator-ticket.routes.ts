import { Router } from "express";
import { getModeratorTicketDetail, getModeratorTicketList } from "../../services/moderator/moderator-ticket-service.js";


export const moderatorTicketsRouter = Router();

moderatorTicketsRouter.get("/", async (_, res, next) => {
    try {
        
        const tickets = await getModeratorTicketList();

        res.status(200).json(tickets);
    } catch (error) {
        next(error);
    }
});

moderatorTicketsRouter.get("/:ticketId", async (req, res, next) => {
    try {
        const ticket = await getModeratorTicketDetail(req.params.ticketId);
        
        if (!ticket) {
            return res.status(404).json({
                error: "Not Found",
                message: "Ticket not found",
            });
        }

        return res.status(200).json(ticket);
    } catch (error) {
        next(error)
    }
})