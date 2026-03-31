"use client";

import { MapPin, Clock, Building2 } from "lucide-react";
import { AppModal } from "@/components/common/app-modal";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@volunteerly/shared";

const WORK_TYPE_LABELS: Record<string, string> = {
    IN_PERSON: "On-site",
    REMOTE:    "Remote",
    HYBRID:    "Hybrid",
};

const COMMITMENT_LABELS: Record<string, string> = {
    FLEXIBLE:  "Flexible",
    PART_TIME: "Part-Time",
    FULL_TIME: "Full-Time",
};

type OppDetailModalProps = {
    opp: Opportunity | null;
    matchPct: number;
    onClose: () => void;
    onApply: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-muted p-3">
            <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}

export function OpportunityDetailModal({ opp, matchPct, onClose, onApply }: OppDetailModalProps) {
    if (!opp) return null;

    const matchCls =
        matchPct >= 80 ? "bg-green-100 text-green-700"
        : matchPct >= 65 ? "bg-secondary text-primary"
        : "bg-muted text-muted-foreground";

    return (
        <AppModal
            open={!!opp}
            onClose={onClose}
            title={opp.name}
            icon={<Building2 className="h-5 w-5 text-primary" />}
            maxWidthClassName="sm:max-w-2xl"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="h-11 min-w-28 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary"
                    >
                        Close
                    </button>
                    <button
                        onClick={onApply}
                        className="h-11 min-w-36 rounded-xl bg-primary px-5 text-sm font-semibold text-foreground hover:opacity-90"
                    >
                        Apply Now
                    </button>
                </>
            }
        >
            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                        {opp.organization?.orgName?.slice(0, 2).toUpperCase() ?? "OG"}
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{opp.organization?.orgName ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">{opp.organization?.hqAdr ?? ""}</p>
                    </div>
                    <span className={cn("ml-auto rounded-full px-3 py-1 text-sm font-semibold", matchCls)}>
                        {matchPct}% Match
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        {WORK_TYPE_LABELS[opp.workType] ?? opp.workType}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        {COMMITMENT_LABELS[opp.commitmentLevel] ?? opp.commitmentLevel}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        {opp.category}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Hours / Week" value={`${opp.hours}h`} />
                    <DetailRow label="Length" value={opp.length || "Flexible"} />
                    <DetailRow
                        label="Deadline"
                        value={
                            opp.deadlineDate
                                ? new Date(opp.deadlineDate).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric",
                                })
                                : "Open"
                        }
                    />
                    <DetailRow
                        label="Posted"
                        value={new Date(opp.postedDate).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                        })}
                    />
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">About This Opportunity</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{opp.description}</p>
                </div>

                {opp.candidateDesc && (
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-foreground">Ideal Candidate</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{opp.candidateDesc}</p>
                    </div>
                )}

                {opp.organization?.hqAdr && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{opp.organization.hqAdr}</span>
                    </div>
                )}
            </div>
        </AppModal>
    );
}