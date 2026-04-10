/**
 * messagesVm.ts
 * View model for the organization's messaging/inbox page
 */

"use client";

import { api } from "@/lib/api";
import { useAppSession } from "@/providers/app-session-provider";
import { useAuth } from "@/providers/auth-provider";
import type { ChatConversationDetail, ChatConversationList } from "@volunteerly/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function useOrganizationMessagesViewModel() {
    const { session, loading } = useAuth();
    const { currentUser, currentOrganization } = useAppSession();

    const [conversations, setConversations] = useState<ChatConversationList>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
        undefined,
    );
    const [selectedConversation, setSelectedConversation] = useState<ChatConversationDetail | null>(
        null,
    );
    const [messageDraft, setMessageDraft] = useState("");
    const [loadingData, setLoadingData] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Support deep-linking into a specific conversation via ?conversationId= query param
    const requestedConversationId = searchParams.get("conversationId") ?? undefined;

    // Clears the selected conversation and removes the conversationId from the URL
    function clearSelection() {
        setSelectedConversationId(undefined);
        setSelectedConversation(null);
        setError(null);
        router.replace(pathname);
    }

    // Load the conversation list on mount, and auto-select either the requested conversation
    // (from query param) or the first one in the list
    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;

            try {
                setLoadingData(true);
                const list = await api<ChatConversationList>("/chat");
                setConversations(list);

                // Prefer the requested conversation if it's in the list, otherwise fall back to first
                const preferredId =
                    requestedConversationId &&
                    list.some((conversation) => conversation.id === requestedConversationId)
                        ? requestedConversationId
                        : list[0]?.id;

                setSelectedConversationId(preferredId);

                if (preferredId) {
                    const detail = await api<ChatConversationDetail>(`/chat/${preferredId}`);
                    setSelectedConversation(detail);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load messages.");
            } finally {
                setLoadingData(false);
            }
        }

        load();
    }, [requestedConversationId, session]);

    // Loads the detail view for a conversation when the user clicks on it in the list
    async function selectConversation(conversationId: string) {
        try {
            setSelectedConversationId(conversationId);
            const detail = await api<ChatConversationDetail>(`/chat/${conversationId}`);
            setSelectedConversation(detail);
        } catch (err) {
            console.error(err);
            setError("Failed to load conversation.");
        }
    }

    // Locally marks the currently selected ticket conversation as CLOSED
    // without a full reload - used when we know the ticket is now closed
    function markSelectedTicketClosed() {
        setSelectedConversation((current) =>
            current && current.kind === "TICKET" ? { ...current, ticketStatus: "CLOSED" } : current,
        );

        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === selectedConversationId && conversation.kind === "TICKET"
                    ? { ...conversation, ticketStatus: "CLOSED" }
                    : conversation,
            ),
        );
    }

    // Sends the current message draft, then refreshes the conversation and list
    // Checks if the ticket is closed before sending to avoid pointless requests
    async function sendMessage() {
        if (!selectedConversationId || !messageDraft.trim()) return;

        try {
            setSending(true);
            setError(null);

            // Re-fetch conversation state before sending to catch any status changes
            const latestDetail = await api<ChatConversationDetail>(
                `/chat/${selectedConversationId}`,
            );

            setSelectedConversation(latestDetail);

            // Block sending if the ticket was closed since we last loaded it
            if (latestDetail.kind === "TICKET" && latestDetail.ticketStatus === "CLOSED") {
                markSelectedTicketClosed();
                setError("This ticket is closed. Replies are disabled.");
                return;
            }

            await api(`/chat/${selectedConversationId}/messages`, {
                method: "POST",
                body: JSON.stringify({ content: messageDraft.trim() }),
            });

            // Refresh both the thread detail and the conversation list after sending
            const detail = await api<ChatConversationDetail>(`/chat/${selectedConversationId}`);
            const list = await api<ChatConversationList>("/chat");

            setSelectedConversation(detail);
            setConversations(list);
            setMessageDraft("");
        } catch (err) {
            console.error(err);

            // Handle the specific case where the API tells us the ticket was closed
            const isClosedTicketError =
                err instanceof Error && err.message.includes("Replies are disabled");

            if (isClosedTicketError) {
                markSelectedTicketClosed();
                setError("This ticket is closed. Replies are disabled.");
            } else {
                setError("Failed to send message.");
            }
        } finally {
            setSending(false);
        }
    }

    // Derives the other participant's name for display in the header
    const headerName = useMemo(() => {
        return selectedConversation?.participants.find(
            (participant) => participant.userId !== currentUser?.id,
        )?.displayName;
    }, [selectedConversation, currentUser?.id]);

    // Gets the full participant object for the other person in the conversation
    const selectedOtherParticipant = useMemo(() => {
        return selectedConversation?.participants.find(
            (participant) => participant.userId !== currentUser?.id,
        );
    }, [selectedConversation, currentUser?.id]);

    const isTicketConversation = selectedConversation?.kind === "TICKET";
    const isClosedTicketConversation =
        selectedConversation?.kind === "TICKET" && selectedConversation.ticketStatus === "CLOSED";

    // Build the thread title - use ticket title if available, otherwise use participant name
    const threadTitle = useMemo(() => {
        if (!selectedConversation) return "Conversation";

        if (selectedConversation.kind === "TICKET") {
            return (
                selectedConversation.title ??
                `Ticket #${(selectedConversation.ticketId ?? selectedConversation.id).slice(-8).toUpperCase()}`
            );
        }

        return selectedOtherParticipant?.displayName ?? "Conversation";
    }, [selectedConversation, selectedOtherParticipant]);

    // Build the subtitle line shown under the thread title
    const threadSubtitle = useMemo(() => {
        if (!selectedConversation) return undefined;

        if (selectedConversation.kind === "TICKET") {
            if (selectedConversation.ticketStatus === "CLOSED") {
                return "Closed support ticket";
            }

            return selectedOtherParticipant
                ? `Moderator: ${selectedOtherParticipant.displayName}`
                : "Awaiting moderator claim";
        }

        return selectedOtherParticipant?.role;
    }, [selectedConversation, selectedOtherParticipant]);

    // Build a short metadata string shown alongside ticket threads (ex. "Ticket #AB12CD34 - Open")
    const threadMeta = useMemo(() => {
        if (selectedConversation?.kind !== "TICKET") return undefined;

        const shortId = (selectedConversation.ticketId ?? selectedConversation.id)
            .slice(-8)
            .toUpperCase();

        const statusLabel =
            selectedConversation.ticketStatus === "CLOSED"
                ? "Closed"
                : selectedConversation.ticketStatus === "OPEN"
                  ? "Open"
                  : "Status unavailable";
        return `Ticket #${shortId} - ${statusLabel}`;
    }, [selectedConversation]);

    return {
        loading: loading || loadingData,
        error,
        currentUserId: currentUser?.id ?? "",
        organizationName: currentOrganization?.orgName ?? "Organization",
        conversations,
        selectedConversationId,
        selectedConversation,
        messageDraft,
        setMessageDraft,
        sending,
        selectConversation,
        sendMessage,
        headerName,
        isTicketConversation,
        isClosedTicketConversation,
        threadTitle,
        threadSubtitle,
        threadMeta,
        clearSelection,
    };
}