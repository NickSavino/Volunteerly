"use client";

import dynamic from "next/dynamic";
import { VolunteerNavbar } from "@/components/volunteer/volunteer-navbar";
import { OpportunityCard } from "@/components/volunteer/opportunity-card";
import { OpportunityDetailModal } from "@/components/volunteer/opportunity-detail-modal";
import { LoadingScreen } from "@/components/common/loading-screen";
import { cn } from "@/lib/utils";
import {
    useOpportunitiesViewModel,
    OPPORTUNITY_CATEGORIES,
    type WorkTypeFilter,
    type CommitmentFilter,
} from "./opportunitiesVm";

const OpportunitiesMap = dynamic(() => import("./OpportunitiesMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

const WORK_TYPE_LABELS: Record<WorkTypeFilter, string> = {
    ALL:       "All",
    REMOTE:    "Remote",
    IN_PERSON: "On-site",
    HYBRID:    "Hybrid",
};

const COMMITMENT_LABELS: Record<CommitmentFilter, string> = {
    ALL:       "Any",
    FLEXIBLE:  "Flexible",
    PART_TIME: "Part-Time",
    FULL_TIME: "Full-Time",
};


export default function OpportunitiesPage() {
    const {
        loading,
        session,
        handleSignOut,
        currentVolunteer,
        opportunities,
        error,
        oppCount,
        selectedOpp,
        setSelectedOpp,
        selectedCategories,
        workType,
        setWorkType,
        commitmentLevel,
        setCommitmentLevel,
        maxHours,
        setMaxHours,
        searchQuery,
        setSearchQuery,
        toggleCategory,
        applyFilters,
        getMatchPct,
        handleApply,
    } = useOpportunitiesViewModel();

    if (loading || !session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoadingScreen />
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <VolunteerNavbar
                currentVolunteer={currentVolunteer}
                onSignOut={handleSignOut}
            />

            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden w-56 flex-shrink-0 overflow-y-auto border-r bg-card p-5 lg:block">
                    <p className="mb-5 text-sm font-semibold text-foreground">Filters</p>

                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Tech Roles
                        </p>
                        <div className="space-y-2">
                            {OPPORTUNITY_CATEGORIES.map((cat) => (
                                <label key={cat} className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => toggleCategory(cat)}
                                        className="h-4 w-4 rounded accent-yellow-400"
                                    />
                                    <span className="text-sm text-foreground">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Engagement
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(["REMOTE", "IN_PERSON", "HYBRID"] as const).map((wt) => (
                                <button
                                    key={wt}
                                    onClick={() => setWorkType(workType === wt ? "ALL" : wt)}
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                        workType === wt
                                            ? "bg-primary text-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-secondary"
                                    )}
                                >
                                    {WORK_TYPE_LABELS[wt]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Commitment
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(["FLEXIBLE", "PART_TIME", "FULL_TIME"] as const).map((cl) => (
                                <button
                                    key={cl}
                                    onClick={() => setCommitmentLevel(commitmentLevel === cl ? "ALL" : cl)}
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                        commitmentLevel === cl
                                            ? "bg-primary text-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-secondary"
                                    )}
                                >
                                    {COMMITMENT_LABELS[cl]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Max Hours
                            </p>
                            <span className="text-xs font-semibold text-primary">{maxHours}h/wk</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={40}
                            value={maxHours}
                            onChange={(e) => setMaxHours(Number(e.target.value))}
                            className="w-full accent-yellow-400"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1h</span><span>40h</span>
                        </div>
                    </div>

                    <button
                        onClick={applyFilters}
                        className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-foreground hover:opacity-90"
                    >
                        Apply Filters
                    </button>
                </aside>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-shrink-0 border-b bg-card px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <h1 className="font-bold text-foreground">
                                {oppCount} {oppCount === 1 ? "Opportunity" : "Opportunities"} Found
                            </h1>
                            <input
                                type="text"
                                placeholder="Search opportunities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                className="hidden rounded-lg border bg-muted px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:block sm:w-56"
                            />
                            <span className="text-sm text-muted-foreground">
                                Sort: <span className="font-medium text-foreground">Relevant</span>
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-5 mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {opportunities.length === 0 ? (
                            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                                No opportunities found. Try adjusting your filters.
                            </div>
                        ) : (
                            opportunities.map((opp) => (
                                <OpportunityCard
                                    key={opp.id}
                                    opp={opp}
                                    matchPct={getMatchPct(opp)}
                                    isSelected={selectedOpp?.id === opp.id}
                                    onClick={() => setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="hidden w-96 flex-shrink-0 overflow-hidden border-l lg:block xl:w-[480px]">
                    <OpportunitiesMap opportunities={opportunities} />
                </div>
            </div>

            <OpportunityDetailModal
                opp={selectedOpp}
                matchPct={selectedOpp ? getMatchPct(selectedOpp) : 0}
                onClose={() => setSelectedOpp(null)}
                onApply={handleApply}
            />
        </div>
    );
}