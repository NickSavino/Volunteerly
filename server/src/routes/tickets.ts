/**
 * tickets.ts
 * Handles ticket creation routes for authenticated users.
 */

import { CreateTicketSchema } from "@volunteerly/shared";
import { Router } from "express";
import { createTicket } from "../services/ticket-service.js";

export const ticketsRouter = Router();

/**
 * POST /tickets
 * Creates a new support ticket for the authenticated user.
 * Auth: required
 * Params: none
 * Body: CreateTicket
 * Returns: 201 with CreatedTicket
 * Errors: 400, 401, 500
 */
ticketsRouter.post("/", async (req, res, next) => {
    try {
        const parsed = CreateTicketSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Invalid ticket payload.",
                details: parsed.error.flatten(),
            });
        }

        const ticket = await createTicket(req.auth!.userId, parsed.data);
        return res.status(201).json(ticket);
    } catch (error) {
        next(error);
    }
});
