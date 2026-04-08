import { api } from "@/lib/api";
import { CreateTicket, CreatedTicket, CreatedTicketSchema } from "@volunteerly/shared";

export class TicketService {
    static async submitTicket(input: CreateTicket): Promise<CreatedTicket> {
        const json = await api<unknown>("/tickets", {
            method: "POST",
            body: JSON.stringify(input),
        });

        const parsed = CreatedTicketSchema.safeParse(json);

        if (!parsed.success) {
            throw new Error("Error submitting ticket.");
        }

        return parsed.data;
    }
}
