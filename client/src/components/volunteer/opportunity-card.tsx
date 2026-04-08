"use client";

import { Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@volunteerly/shared";

const WORK_TYPE_LABELS: Record<string, string> = {
    IN_PERSON: "On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
};

function getAvatarColor(name: string): string {
    const colors = [
        "bg-blue-100 text-blue-700",
        "bg-purple-100 text-purple-700",
        "bg-orange-100 text-orange-700",
        "bg-green-100 text-green-700",
        "bg-pink-100 text-pink-700",
        "bg-teal-100 text-teal-700",
    ];
    const idx = (name.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
}

type OppCardProps = {
    opp: Opportunity;
    matchPct: number;
    isSelected: boolean;
    hasApplied: boolean;
    onClick: () => void;
};

function MatchBadge({ pct }: { pct: number }) {
    const cls =
        pct >= 80
            ? "bg-green-100 text-green-700"
            : pct >= 65
              ? "bg-secondary text-primary"
              : "bg-muted text-muted-foreground";

    return <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>{pct}% Match</span>;
}

export function OpportunityCard({ opp, matchPct, isSelected, hasApplied, onClick }: OppCardProps) {
    const router = useRouter();
    const avatarColor = getAvatarColor(opp.organization?.orgName ?? "O");
    const initials = opp.organization?.orgName?.slice(0, 2).toUpperCase() ?? "OG";
    const orgId = opp.organization?.id;

    function handleOrgClick(e: React.MouseEvent) {
        if (!orgId) return;
        e.stopPropagation();
        router.push(`/volunteer/organizations/${orgId}`);
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                `
                    cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-shadow
                    hover:shadow-md
                `,
                isSelected && "ring-2 ring-primary",
            )}
        >
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOrgClick}
                        className={cn(
                            `
                                flex size-10 shrink-0 items-center justify-center rounded-full
                                text-sm font-bold transition-opacity
                                hover:opacity-75
                            `,
                            avatarColor,
                            !orgId && "pointer-events-none",
                        )}
                    >
                        {initials}
                    </button>
                    <div>
                        <p className="leading-tight font-semibold text-foreground">{opp.name}</p>
                        <button
                            onClick={handleOrgClick}
                            className={cn(
                                `
                                    text-left text-xs text-muted-foreground
                                    hover:underline
                                `,
                                !orgId && "pointer-events-none",
                            )}
                        >
                            {opp.organization?.orgName ?? "—"}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <MatchBadge pct={matchPct} />
                    {hasApplied && (
                        <span
                            className="
                            rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold
                            text-green-700
                        "
                        >
                            ✓ Applied
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {opp.category}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {opp.hours}h/week
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {WORK_TYPE_LABELS[opp.workType] ?? opp.workType}
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    className="
                        rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-foreground
                        transition-opacity
                        hover:opacity-90
                    "
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
