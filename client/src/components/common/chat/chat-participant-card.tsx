/**
 * chat-participant-card.tsx
 * Renders participant details and available actions for a chat thread.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactNode } from "react";

type ChatParticipantCardProps = {
    displayName: string;
    subtitle?: string;
    metaLine?: string;
    location?: string;
    avatarUrl?: string;
    avatarFallback: string;
    actions?: ReactNode;
};

export function ChatParticipantCard({
    displayName,
    subtitle,
    metaLine,
    location,
    avatarUrl,
    avatarFallback,
    actions,
}: ChatParticipantCardProps) {
    return (
        <div className="border-b border-border p-6">
            <div className="flex items-start gap-4">
                <Avatar className="size-16 border border-border">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-2xl font-bold text-foreground">{displayName}</h3>
                    {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
                    {metaLine ? <p className="text-sm text-muted-foreground">{metaLine}</p> : null}
                    {location ? (
                        <p className="mt-1 text-xl text-muted-foreground">{location}</p>
                    ) : null}
                </div>
            </div>

            {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
    );
}
