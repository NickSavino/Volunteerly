"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ChatConversationDetail,
  ChatConversationList,
} from "@volunteerly/shared";
import { useAuth } from "@/providers/auth-provider";
import { useAppSession } from "@/providers/app-session-provider";
import { api } from "@/lib/api";

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

  useEffect(() => {
    async function load() {
      if (!session?.access_token) return;

      try {
        setLoadingData(true);
        const list = await api<ChatConversationList>("/chat");
        setConversations(list);

        const initialId = list[0]?.id;
        setSelectedConversationId(initialId);

        if (initialId) {
          const detail = await api<ChatConversationDetail>(`/chat/${initialId}`);
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
  }, [session]);

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
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  const headerName = useMemo(() => {
    return selectedConversation?.participants.find(
      (participant) => participant.userId !== currentUser?.id
    )?.displayName;
  }, [selectedConversation, currentUser?.id]);

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
  };
}