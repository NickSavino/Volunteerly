import { Router } from "express";
import { CreateTicketSchema } from "@volunteerly/shared";
import { createTicket } from "../services/ticket-service.js";

export const ticketsRouter = Router();

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
