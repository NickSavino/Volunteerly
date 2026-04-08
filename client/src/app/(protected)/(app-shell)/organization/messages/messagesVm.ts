"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ChatConversationDetail,
  ChatConversationList,
} from "@volunteerly/shared";
import { useAuth } from "@/providers/auth-provider";
import { useAppSession } from "@/providers/app-session-provider";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";

export function useOrganizationMessagesViewModel() {
  const { session, loading } = useAuth();
  const { currentUser, currentOrganization } = useAppSession();

  const [conversations, setConversations] = useState<ChatConversationList>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationDetail | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId") ?? undefined;


  useEffect(() => {
    async function load() {
      if (!session?.access_token) return;

      try {
        setLoadingData(true);
        const list = await api<ChatConversationList>("/chat");
        setConversations(list);

        const preferredId =
          requestedConversationId && list.some((conversation) => conversation.id === requestedConversationId)
            ? requestedConversationId
            : list[0]?.id

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

  async function sendMessage() {
    if (!selectedConversationId || !messageDraft.trim()) return;

    try {
      setSending(true);
      await api(`/chat/${selectedConversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageDraft.trim() }),
      });

      const detail = await api<ChatConversationDetail>(`/chat/${selectedConversationId}`);
      const list = await api<ChatConversationList>("/chat");

      setSelectedConversation(detail);
      setConversations(list);
      setMessageDraft("");
    } catch (err) {
      console.error(err);
      const isClosedTicketError =
        err instanceof Error && err.message.includes("Replies are disabled");

      if (isClosedTicketError) {
        setSelectedConversation((current) =>
          current && current.kind === "TICKET"
            ? { ...current, ticketStatus: "CLOSED" }
            : current
        );

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedConversationId && conversation.kind === "TICKET"
              ? { ...conversation, ticketStatus: "CLOSED" }
              : conversation
          )
        );

        setError("This ticket is closed. Replies are disabled.");
      } else {
        setError("Failed to send message.");
      }
    } finally {

      setSending(false);
    }
  }

  const headerName = useMemo(() => {
    return selectedConversation?.participants.find(
      (participant) => participant.userId !== currentUser?.id
    )?.displayName;
  }, [selectedConversation, currentUser?.id]);

    const selectedOtherParticipant = useMemo(() => {
    return selectedConversation?.participants.find(
      (participant) => participant.userId !== currentUser?.id
    );
  }, [selectedConversation, currentUser?.id]);

  const isTicketConversation = selectedConversation?.kind === "TICKET";
  const isClosedTicketConversation = selectedConversation?.kind === "TICKET" && selectedConversation.ticketStatus === "CLOSED";

  const threadTitle = useMemo(() => {
    if (!selectedConversation) return "Conversation";

    if (selectedConversation.kind === "TICKET") {
      return (
        selectedConversation.title ??
        `Ticket #${(selectedConversation.ticketId ?? selectedConversation.id)
          .slice(-8)
          .toUpperCase()}`
      );
    }

    return selectedOtherParticipant?.displayName ?? "Conversation";
  }, [selectedConversation, selectedOtherParticipant]);

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

  const threadMeta = useMemo(() => {
    if (selectedConversation?.kind !== "TICKET") return undefined;

    const shortId = (selectedConversation.ticketId ?? selectedConversation.id)
      .slice(-8)
      .toUpperCase();

    const statusLabel = selectedConversation.ticketStatus === "CLOSED" ? "Closed" : "Open";
    return `Ticket #${shortId} • ${statusLabel}`;
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
  };
}