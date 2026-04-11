/**
 * chat-conversation-list.tsx
 * Renders the list of available chat conversations.
 */

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatConversationListItem as ChatConversationListItemType } from "@volunteerly/shared";
import { ChatConversationListItem } from "./chat-conversation-list-item";

type ChatConversationListProps = {
    conversations: ChatConversationListItemType[];
    selectedConversationId?: string;
    onSelect: (conversationId: string) => void;
    sectionTitle: string;
};

export function ChatConversationList({
    conversations,
    selectedConversationId,
    onSelect,
    sectionTitle,
}: ChatConversationListProps) {
    return (
        <div
            className="
                flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-border
                bg-background
            "
        >
            <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-bold tracking-[0.18em] text-muted-foreground uppercase">
                    {sectionTitle}
                </p>
            </div>

            <ScrollArea className="h-full min-w-0">
                <div className="min-w-0 overflow-hidden">
                    {conversations.map((conversation) => (
                        <ChatConversationListItem
                            key={conversation.id}
                            conversation={conversation}
                            active={conversation.id === selectedConversationId}
                            onClick={() => onSelect(conversation.id)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
