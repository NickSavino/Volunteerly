"use client";

import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@volunteerly/shared";

const WORK_TYPE_LABELS: Record<string, string> = {
    IN_PERSON: "On-site",
    REMOTE:    "Remote",
    HYBRID:    "Hybrid",
};

type OppCardProps = {
    opp: Opportunity;
    matchPct: number;
    isSelected: boolean;
    onClick: () => void;
};

function MatchBadge({ pct }: { pct: number }) {
    const cls =
        pct >= 80 ? "bg-green-100 text-green-700"
        : pct >= 65 ? "bg-secondary text-primary"
        : "bg-muted text-muted-foreground";

    return (
        <span className={cn("flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>
            {pct}% Match
        </span>
    );
}

export function OpportunityCard({ opp, matchPct, isSelected, onClick }: OppCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                isSelected && "ring-2 ring-primary"
            )}
        >
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                        {opp.organization?.orgName?.slice(0, 2).toUpperCase() ?? "OG"}
                    </div>
                    <div>
                        <p className="font-semibold text-foreground leading-tight">{opp.name}</p>
                        <p className="text-xs text-muted-foreground">{opp.organization?.orgName ?? "—"}</p>
                    </div>
                </div>
                <MatchBadge pct={matchPct} />
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {opp.category}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {opp.hours}h/week
                </span>
                <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {WORK_TYPE_LABELS[opp.workType] ?? opp.workType}
                </span>
            </div>
        </div>
    );
}