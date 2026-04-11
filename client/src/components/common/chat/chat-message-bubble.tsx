/**
 * chat-message-bubble.tsx
 * Renders a single chat message with sender and timestamp styling.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@volunteerly/shared";

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

type ChatMessageBubbleProps = {
    message: ChatMessage;
    isOwnMessage: boolean;
    showAvatar?: boolean;
    showRole?: boolean;
    variant?: "default" | "ticket";
    senderAvatarFallback?: string;
};

export function ChatMessageBubble({
    message,
    isOwnMessage,
    showAvatar = false,
    showRole = true,
    variant = "default",
    senderAvatarFallback = message.senderDisplayName.slice(0, 2).toUpperCase(),
}: ChatMessageBubbleProps) {
    return (
        <div className={cn("flex w-full gap-3", isOwnMessage ? "justify-end" : "justify-start")}>
            {!isOwnMessage && showAvatar ? (
                <Avatar className="mt-1 size-10 border border-border">
                    <AvatarImage src={message.senderAvatarUrl ?? undefined} />
                    <AvatarFallback>{senderAvatarFallback}</AvatarFallback>
                </Avatar>
            ) : null}

            <div className={cn("max-w-[78%]", isOwnMessage && "items-end")}>
                {!isOwnMessage && (showRole || variant === "ticket") ? (
                    <div className="mb-1 flex items-center gap-2 px-1">
                        <p className="text-sm font-semibold text-foreground">
                            {message.senderDisplayName}
                        </p>
                        {showRole ? (
                            <p className="text-sm text-muted-foreground">{message.senderRole}</p>
                        ) : null}
                    </div>
                ) : null}

                <div
                    className={cn(
                        "rounded-[1.5rem] px-4 py-3 text-base/relaxed shadow-sm",
                        isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : variant === "ticket"
                              ? "border border-border bg-secondary text-foreground"
                              : "bg-secondary text-foreground",
                    )}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                <p
                    className={cn(
                        "mt-2 px-1 text-xs text-muted-foreground",
                        isOwnMessage && "text-right",
                    )}
                >
                    {formatTime(message.sentAt)}
                </p>
            </div>
        </div>
    );
}
