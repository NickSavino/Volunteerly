"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ChatThreadHeaderProps = {
    title: string;
    subtitle?: string;
    meta?: string;
    avatarUrl?: string;
    avatarFallback: string;
};

export function ChatThreadHeader({
    title,
    subtitle,
    meta,
    avatarUrl,
    avatarFallback,
}: ChatThreadHeaderProps) {
    return (
        <div className="flex items-center gap-4 border-b border-border bg-background px-6 py-5">
            <Avatar className="size-14 border border-border">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold text-foreground">{title}</h2>
                {subtitle ? <p className="text-base text-muted-foreground">{subtitle}</p> : null}
                {meta ? <p className="text-sm text-primary">{meta}</p> : null}
            </div>
        </div>
    );
}
