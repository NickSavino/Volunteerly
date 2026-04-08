"use client";

import { api } from "@/lib/api";
import { ModeratorService } from "@/services/ModeratorService";
import { ModeratorTicketDetail } from "@volunteerly/shared";
import { useEffect, useState } from "react";

type UseTicketDetailViewModelArgs = {
    ticketId: string | null;
    open: boolean;
    currentUserId: string;
    onTicketUpdated?: () => Promise<void> | void;
};

export function UseTicketDetailViewModel({
    ticketId,
    open,
    currentUserId,
    onTicketUpdated,
}: UseTicketDetailViewModelArgs) {
    const [ticket, setTicket] = useState<ModeratorTicketDetail | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [updatingTicket, setUpdatingTicket] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatParticipant = ticket?.issuer ?? null;

    const canClaim = ticket?.status === "OPEN" && ticket?.targetId !== currentUserId;
    const canClose = ticket?.status === "OPEN" && ticket?.targetId === currentUserId;
    const canReply = !!ticket?.conversation?.id && canClose;

    async function loadTicketDetail(id: string) {
        setLoading(true);
        setError(null);

        try {
            const detail = await ModeratorService.getModeratorTicketDetail(id);
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
    }, [open, ticketId]);

    async function sendReply() {
        if (!ticket?.conversation?.id || !canReply || !replyDraft.trim()) return;

        setSending(true);
        setError(null);

        try {
            await api(`/chat/${ticket.conversation.id}/messages`, {
                method: "POST",
                body: JSON.stringify({
                    content: replyDraft.trim(),
                }),
            });

            setReplyDraft("");
            await loadTicketDetail(ticket.id);
        } catch (err) {
            console.error(err);
            setError("Failed to send reply.");
        } finally {
            setSending(false);
        }
    }

    async function claimTicket() {
        if (!ticket) return;

        setUpdatingTicket(true);
        setError(null);

        try {
            const detail = await ModeratorService.claimModeratorTicket(ticket.id);
            setTicket(detail);
            await onTicketUpdated?.();
        } catch (err) {
            console.error(err);
            setError("Failed to claim ticket.");
        } finally {
            setUpdatingTicket(false);
        }
    }

    async function closeTicket() {
        if (!ticket) return;

        setUpdatingTicket(true);
        setError(null);

        try {
            const detail = await ModeratorService.closeModeratorTicket(ticket.id);
            setTicket(detail);
            await onTicketUpdated?.();
        } catch (err) {
            console.error(err);
            setError("Failed to close ticket.");
        } finally {
            setUpdatingTicket(false);
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
        sendReply,
        updatingTicket,
        canClaim,
        canClose,
        canReply,
        claimTicket,
        closeTicket,
    };
}
