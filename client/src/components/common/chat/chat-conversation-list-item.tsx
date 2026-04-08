"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatConversationListItem } from "@volunteerly/shared";

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

type ChatConversationListItemProps = {
    conversation: ChatConversationListItem;
    active: boolean;
    onClick: () => void;
};

export function ChatConversationListItem({ conversation, active, onClick }: ChatConversationListItemProps) {
    const fallback =
        conversation.kind === "TICKET"
            ? "TK"
            : (conversation.otherParticipant?.displayName.slice(0, 2).toUpperCase() ?? "CH");

    const conversationTitle =
        conversation.kind === "TICKET"
            ? (conversation.title ?? `Ticket #${(conversation.ticketId ?? conversation.id).slice(-8).toUpperCase()}`)
            : (conversation.otherParticipant?.displayName ?? conversation.title ?? "Conversation");

    const preview =
        conversation.kind === "TICKET" && conversation.ticketStatus === "CLOSED"
            ? `Closed • ${conversation.lastMessagePreview || "No messages yet"}`
            : conversation.lastMessagePreview || "No messages yet";
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-start gap-3 border-l-4 px-4 py-4 text-left transition-colors",
                active ? "border-l-primary bg-secondary" : "border-l-transparent hover:bg-secondary/60",
            )}
        >
            <Avatar className="size-12 border border-border">
                <AvatarImage src={conversation.otherParticipant?.avatarUrl ?? undefined} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-foreground">{conversationTitle}</p>
                        <p className="truncate text-sm text-muted-foreground">{preview}</p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">{formatTime(conversation.lastMessageAt)}</p>
                </div>
            </div>
        </button>
    );
}
