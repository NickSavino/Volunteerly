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
        <div className="flex h-full flex-col border-r border-border bg-background">
            <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{sectionTitle}</p>
            </div>

            <ScrollArea className="h-full">
                <div>
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
