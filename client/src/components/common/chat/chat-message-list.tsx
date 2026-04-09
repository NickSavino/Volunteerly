"use client";

import type { ChatMessage } from "@volunteerly/shared";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessageListProps = {
    messages: ChatMessage[];
    currentUserId: string;
    variant?: "default" | "ticket";
    className?: string;
};

export function ChatMessageList({
    messages,
    currentUserId,
    variant = "default",
    className,
}: ChatMessageListProps) {
    return (
        <ScrollArea className={className ?? "h-full"}>
            <div className="space-y-5 p-6">
                {messages.map((message) => (
                    <ChatMessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.senderId === currentUserId}
                        showAvatar={variant === "ticket"}
                        showRole={variant === "ticket"}
                        variant={variant}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
