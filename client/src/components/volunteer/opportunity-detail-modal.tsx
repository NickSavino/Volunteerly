/**
 * opportunity-detail-modal.tsx
 * Slide-in modal showing full details of a selected opportunity with an apply / already-applied state
 */
"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/common/app-modal";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@volunteerly/shared";

const WORK_TYPE_LABELS: Record<string, string> = {
    IN_PERSON: "On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
};

const COMMITMENT_LABELS: Record<string, string> = {
    FLEXIBLE: "Flexible (2–5 hrs)",
    PART_TIME: "Part-Time (5–20 hrs)",
    FULL_TIME: "Full-Time (20+ hrs)",
};

type OppDetailModalProps = {
    opp: Opportunity | null;
    matchPct: number;
    hasApplied: boolean;
    onClose: () => void;
    onApply: () => void;
};

/**
 * Small labeled info block used in the detail grid (length, deadline, posted date)
 */
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-muted p-3">
            <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}

/**
 * Full-detail modal for a volunteer opportunity
 * Returns null when no opportunity is selected so the modal is simply absent from the DOM
 */
export function OpportunityDetailModal({
    opp,
    matchPct,
    hasApplied,
    onClose,
    onApply,
}: OppDetailModalProps) {
    const router = useRouter();

    // Nothing selected - don't render anything
    if (!opp) return null;

    const orgId = opp.organization?.id;

    /**
     * Closes the modal then navigates to the org's public profile
     * Closing first avoids a flash of the modal over the new page
     */
    function handleOrgClick() {
        if (!orgId) return;
        onClose();
        router.push(`/volunteer/organizations/${orgId}`);
    }

    // Match badge color thresholds mirror those in OpportunityCard
    const matchCls =
        matchPct >= 80
            ? "bg-green-100 text-green-700"
            : matchPct >= 65
              ? "bg-secondary text-primary"
              : "bg-muted text-muted-foreground";

    return (
        <AppModal
            open={!!opp}
            onClose={onClose}
            title={opp.name}
            icon={<Building2 className="size-5 text-primary" />}
            maxWidthClassName="sm:max-w-2xl"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="
                            h-11 min-w-28 rounded-xl border border-border bg-card px-5 text-sm
                            font-semibold text-foreground
                            hover:bg-secondary
                        "
                    >
                        Close
                    </button>
                    {/* Footer action switches between a static "Applied" badge and the Apply button */}
                    {hasApplied ? (
                        <span
                            className="
                                flex h-11 min-w-36 items-center justify-center rounded-xl
                                bg-green-100 px-5 text-sm font-semibold text-green-700
                            "
                        >
                            ✓ Applied
                        </span>
                    ) : (
                        <button
                            onClick={onApply}
                            className="
                                h-11 min-w-36 rounded-xl bg-primary px-5 text-sm font-semibold
                                text-foreground
                                hover:opacity-90
                            "
                        >
                            Apply Now
                        </button>
                    )}
                </>
            }
        >
            <div className="space-y-5">
                {/* Organization header row with avatar, name, address, and match badge */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOrgClick}
                        className={cn(
                            `
                                flex size-12 shrink-0 items-center justify-center rounded-full
                                bg-secondary text-sm font-bold text-primary transition-opacity
                                hover:opacity-75
                            `,
                            !orgId && "pointer-events-none",
                        )}
                    >
                        {opp.organization?.orgName?.slice(0, 2).toUpperCase() ?? "OG"}
                    </button>
                    <div>
                        <button
                            onClick={handleOrgClick}
                            className={cn(
                                `
                                    font-semibold text-foreground text-left
                                    hover:underline
                                `,
                                !orgId && "pointer-events-none",
                            )}
                        >
                            {opp.organization?.orgName ?? "—"}
                        </button>
                        <p className="text-sm text-muted-foreground">
                            {opp.organization?.hqAdr ?? ""}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 ml-auto">
                        <span
                            className={cn("rounded-full px-3 py-1 text-sm font-semibold", matchCls)}
                        >
                            {matchPct}% Match
                        </span>
                        {hasApplied && (
                            <span
                                className="
                                    rounded-full bg-green-100 px-3 py-1 text-sm font-semibold
                                    text-green-700
                                "
                            >
                                ✓ Applied
                            </span>
                        )}
                    </div>
                </div>

                {/* Tag row: work type, commitment level, category */}
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

                {/* Key metadata grid */}
                <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Length" value={opp.length || "Flexible"} />
                    <DetailRow
                        label="Deadline"
                        value={
                            opp.deadlineDate
                                ? new Date(opp.deadlineDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "Open"
                        }
                    />
                    <DetailRow
                        label="Posted"
                        value={new Date(opp.postedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    />
                </div>

                {/* Availability days - only shown if the opportunity specifies scheduling */}
                {opp?.availability && opp.availability.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-gray-800">Availability</p>

                        <div className="flex flex-wrap gap-2">
                            {opp.availability.map((day: string) => (
                                <span
                                    key={day}
                                    className="
                                        px-3 py-1.5 rounded-lg border text-xs font-medium
                                        border-yellow-400 text-gray-800 bg-yellow-50
                                    "
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                        About This Opportunity
                    </h3>
                    <p className="text-sm/relaxed text-muted-foreground">{opp.description}</p>
                </div>

                {/* Ideal candidate section - optional field set by the organization */}
                {opp.candidateDesc && (
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-foreground">
                            Ideal Candidate
                        </h3>
                        <p className="text-sm/relaxed text-muted-foreground">{opp.candidateDesc}</p>
                    </div>
                )}
            </div>
        </AppModal>
    );
}
