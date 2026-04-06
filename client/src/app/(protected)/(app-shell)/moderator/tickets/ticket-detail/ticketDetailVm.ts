"use client";

import { api } from "@/lib/api";
import { ModeratorTicketDetail } from "@volunteerly/shared";
import { useEffect, useState } from "react";

type UseTicketDetailViewModelArgs = {
    ticketId: string | null;
    open: boolean;
};

export function UseTicketDetailViewModel({
    ticketId,
    open,
} : UseTicketDetailViewModelArgs) {
    const [ticket, setTicket] = useState<ModeratorTicketDetail | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatParticipant = ticket?.issuer ?? null;

    async function loadTicketDetail(id: string) {
        setLoading(true);
        setError(null)

        try {
            const detail = await api<ModeratorTicketDetail>(`/moderator/tickets/${id}`)
            setTicket(detail);
        } catch (err) {
            console.error(err);
            setError("Failed to load ticket conversation.");
            setTicket(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!open || !ticketId) {
            setTicket(null);
            setReplyDraft("");
            setError(null);
            return;
        }

        void loadTicketDetail(ticketId);
    }, [open, ticketId])

    async function sendReply() {
        if (!ticket?.conversation?.id || !replyDraft.trim()) return;

        setSending(true);
        setError(null);

        try {
            await api(`/chat/${ticket.conversation.id}/messages`, {
                method: "POST",
                body: JSON.stringify({
                    content: replyDraft.trim(),
                }),
            });

            setReplyDraft("")
            await loadTicketDetail(ticket.id);
        } catch (err) {
            console.error(err);
            setError("Failed to send reply.");
        } finally {
            setSending(false);
        }
    }

    return {
            ticket,
            chatParticipant,
            replyDraft,
            setReplyDraft,
            loading,
            sending,
            error,
            sendReply
        }
}