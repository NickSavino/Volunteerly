import { Router } from "express";
import {
    claimModeratorTicket,
    closeModeratorTicket,
    getModeratorTicketDetail,
    getModeratorTicketList,
} from "../../services/moderator/moderator-ticket-service.js";

export const moderatorTicketsRouter = Router();

/**
 * GET /moderator/tickets
 * Fetches the moderator ticket list.
 * Auth: required (MODERATOR)
 * Params: none
 * Body: none
 * Returns: 200 with ModeratorTicketList
 * Errors: 401, 500
 */
moderatorTicketsRouter.get("/", async (_, res, next) => {
    try {
        const tickets = await getModeratorTicketList();

        res.status(200).json(tickets);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /moderator/tickets/:ticketId
 * Fetches detailed data for a single moderator ticket.
 * Auth: required (MODERATOR)
 * Params: ticketId
 * Body: none
 * Returns: 200 with ModeratorTicketDetail
 * Errors: 401, 404, 500
 */
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
        next(error);
    }
});

/**
 * PATCH /moderator/tickets/:ticketId/claim
 * Claims a moderator ticket for the authenticated moderator.
 * Auth: required (MODERATOR)
 * Params: ticketId
 * Body: none
 * Returns: 200 with updated ticket detail
 * Errors: 401, 404, 409, 500
 */
moderatorTicketsRouter.patch("/:ticketId/claim", async (req, res, next) => {
    try {
        const ticket = await claimModeratorTicket(req.params.ticketId, req.auth!.userId);
        return res.status(200).json(ticket);
    } catch (error: any) {
        if (error?.message === "TICKET_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Ticket not found." });
        }

        if (error?.message === "TICKET_CLOSED") {
            return res
                .status(409)
                .json({ error: "Conflict", message: "Closed tickets cannot be claimed." });
        }

        next(error);
    }
});

/**
 * PATCH /moderator/tickets/:ticketId/close
 * Closes a claimed moderator ticket.
 * Auth: required (MODERATOR)
 * Params: ticketId
 * Body: none
 * Returns: 200 with updated ticket detail
 * Errors: 401, 404, 409, 500
 */
moderatorTicketsRouter.patch("/:ticketId/close", async (req, res, next) => {
    try {
        const ticket = await closeModeratorTicket(req.params.ticketId, req.auth!.userId);
        return res.status(200).json(ticket);
    } catch (error: any) {
        if (error?.message === "TICKET_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Ticket not found." });
        }

        if (error?.message === "TICKET_CLOSED") {
            return res
                .status(409)
                .json({ error: "Conflict", message: "Ticket is already closed." });
        }

        if (error?.message === "TICKET_NOT_ASSIGNED") {
            return res
                .status(409)
                .json({ error: "Conflict", message: "Claim the ticket before closing it." });
        }

        next(error);
    }
});
