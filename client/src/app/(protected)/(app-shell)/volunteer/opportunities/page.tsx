"use client";

import dynamic from "next/dynamic";
import { useRef, useCallback, useState } from "react";
import { ArrowUpDown, SlidersHorizontal, Map } from "lucide-react";
import { OpportunityCard } from "@/components/volunteer/opportunity-card";
import { OpportunityDetailModal } from "@/components/volunteer/opportunity-detail-modal";
import { ApplyModal } from "@/components/volunteer/apply-modal";
import { LoadingScreen } from "@/components/common/loading-screen";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    useOpportunitiesViewModel,
    OPPORTUNITY_CATEGORIES,
    type WorkTypeFilter,
    type CommitmentFilter,
    type SortOption,
} from "./opportunitiesVm";

const OpportunitiesMap = dynamic(() => import("./OpportunitiesMap"), {
    ssr: false,
    loading: () => <div className="size-full animate-pulse bg-muted" />,
});

const WORK_TYPE_LABELS: Record<WorkTypeFilter, string> = {
    ALL: "All",
    REMOTE: "Remote",
    IN_PERSON: "On-site",
    HYBRID: "Hybrid",
};

const COMMITMENT_LABELS: Record<CommitmentFilter, string> = {
    ALL: "Any",
    FLEXIBLE: "Flexible",
    PART_TIME: "Part-Time",
    FULL_TIME: "Full-Time",
};

const SORT_LABELS: Record<SortOption, string> = {
    RELEVANT: "Relevant",
    MATCH_HIGH: "Best Match",
    MATCH_LOW: "Lowest Match",
    HOURS_LOW: "Fewest Hours",
    HOURS_HIGH: "Most Hours",
    NEWEST: "Newest",
};

const MAP_MIN_WIDTH = 200;
const MAP_MAX_WIDTH = 800;
const MAP_DEFAULT_WIDTH = 420;

function FiltersContent({
    selectedCategories,
    toggleCategory,
    workType,
    setWorkType,
    commitmentLevel,
    setCommitmentLevel,
    maxHours,
    setMaxHours,
    applyFilters,
    onClose,
}: {
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    workType: WorkTypeFilter;
    setWorkType: (v: WorkTypeFilter) => void;
    commitmentLevel: CommitmentFilter;
    setCommitmentLevel: (v: CommitmentFilter) => void;
    maxHours: number;
    setMaxHours: (v: number) => void;
    applyFilters: () => void;
    onClose?: () => void;
}) {
    return (
        <>
            <div className="mb-6">
                <p className="
                    mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase
                ">Roles</p>
                <div className="space-y-2">
                    {OPPORTUNITY_CATEGORIES.map((cat) => (
                        <label key={cat} className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat)}
                                onChange={() => toggleCategory(cat)}
                                className="size-4 rounded-sm accent-yellow-400"
                            />
                            <span className="text-sm text-foreground">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <p className="
                    mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase
                ">Engagement</p>
                <div className="flex flex-wrap gap-2">
                    {(["REMOTE", "IN_PERSON", "HYBRID"] as const).map((wt) => (
                        <button
                            key={wt}
                            onClick={() => setWorkType(workType === wt ? "ALL" : wt)}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                workType === wt
                                    ? "bg-primary text-foreground"
                                    : `
                                        bg-muted text-muted-foreground
                                        hover:bg-secondary
                                    `,
                            )}
                        >
                            {WORK_TYPE_LABELS[wt]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <p className="
                    mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase
                ">Commitment</p>
                <div className="flex flex-wrap gap-2">
                    {(["FLEXIBLE", "PART_TIME", "FULL_TIME"] as const).map((cl) => (
                        <button
                            key={cl}
                            onClick={() => setCommitmentLevel(commitmentLevel === cl ? "ALL" : cl)}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                commitmentLevel === cl
                                    ? "bg-primary text-foreground"
                                    : `
                                        bg-muted text-muted-foreground
                                        hover:bg-secondary
                                    `,
                            )}
                        >
                            {COMMITMENT_LABELS[cl]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                    <p className="
                        text-xs font-semibold tracking-wide text-muted-foreground uppercase
                    ">Max Hours</p>
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
                    <span>1h</span>
                    <span>40h</span>
                </div>
            </div>

            <button
                onClick={() => {
                    applyFilters();
                    onClose?.();
                }}
                className="
                    w-full rounded-xl bg-primary py-2 text-sm font-semibold text-foreground
                    hover:opacity-90
                "
            >
                Apply Filters
            </button>
        </>
    );
}

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
        sortBy,
        setSortBy,
        toggleCategory,
        applyFilters,
        getMatchPct,
        handleApply,
        applyModalOpen,
        setApplyModalOpen,
        submitApplication,
        appliedOppIds,
    } = useOpportunitiesViewModel();

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);

    const mapWidthRef = useRef<number>(MAP_DEFAULT_WIDTH);
    const mapPanelRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const onMouseMove = (ev: MouseEvent) => {
            if (!isDragging.current || !mapPanelRef.current) return;
            const newWidth = window.innerWidth - ev.clientX;
            const clamped = Math.min(Math.max(newWidth, MAP_MIN_WIDTH), MAP_MAX_WIDTH);
            mapWidthRef.current = clamped;
            mapPanelRef.current.style.width = `${clamped}px`;
        };

        const onMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    const filterProps = {
        selectedCategories,
        toggleCategory,
        workType,
        setWorkType,
        commitmentLevel,
        setCommitmentLevel,
        maxHours,
        setMaxHours,
        applyFilters,
    };

    if (loading || !session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoadingScreen />
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <div className="flex flex-1 overflow-hidden">
                <aside className="
                    hidden w-56 shrink-0 overflow-y-auto border-r bg-card p-5
                    lg:block
                ">
                    <p className="mb-5 text-sm font-semibold text-foreground">= Filters</p>
                    <FiltersContent {...filterProps} />
                </aside>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="shrink-0 border-b bg-card px-5 py-4">
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
                                    className="
                                        hidden rounded-lg border bg-muted px-3 py-1.5 text-sm
                                        text-foreground
                                        placeholder:text-muted-foreground
                                        focus:ring-2 focus:ring-ring focus:outline-none
                                        sm:block sm:w-56
                                    "
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFiltersOpen(true)}
                                        className="
                                            flex items-center gap-1.5 rounded-lg border bg-muted
                                            px-3 py-1.5 text-sm font-medium text-foreground
                                            lg:hidden
                                        "
                                    >
                                        <SlidersHorizontal className="size-4" />
                                        Filters
                                    </button>
                                    <button
                                        onClick={() => setMapOpen(true)}
                                        className="
                                            flex items-center gap-1.5 rounded-lg border bg-muted
                                            px-3 py-1.5 text-sm font-medium text-foreground
                                            lg:hidden
                                        "
                                    >
                                        <Map className="size-4" />
                                        Map
                                    </button>

                                    <div className="
                                        flex items-center gap-1.5 text-sm text-muted-foreground
                                    ">
                                        <ArrowUpDown className="size-3.5 shrink-0" />
                                        <span className="
                                            hidden
                                            sm:inline
                                        ">Sort:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="
                                                cursor-pointer rounded-md border-0 bg-transparent
                                                py-0 pr-6 text-sm font-medium text-foreground
                                                focus:ring-0 focus:outline-none
                                            "
                                        >
                                            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {SORT_LABELS[opt]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="
                                mx-5 mt-4 rounded-xl border border-destructive/20 bg-destructive/10
                                px-4 py-2 text-sm text-destructive
                            ">
                                {error}
                            </div>
                        )}

                        <div className="flex-1 space-y-4 overflow-y-auto p-5">
                            {opportunities.length === 0 ? (
                                <div className="
                                    flex h-40 items-center justify-center text-sm
                                    text-muted-foreground
                                ">
                                    No opportunities found. Try adjusting your filters.
                                </div>
                            ) : (
                                opportunities.map((opp) => (
                                    <OpportunityCard
                                        key={opp.id}
                                        opp={opp}
                                        matchPct={getMatchPct(opp)}
                                        isSelected={selectedOpp?.id === opp.id}
                                        hasApplied={appliedOppIds.has(opp.id)}
                                        onClick={() => setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div
                        onMouseDown={onMouseDown}
                        className="
                            group hidden w-1.5 shrink-0 cursor-col-resize items-center
                            justify-center bg-border transition-colors
                            hover:bg-primary/40
                            lg:flex
                        "
                        title="Drag to resize map"
                    >
                        <div className="
                            h-8 w-0.5 rounded-full bg-muted-foreground/30 transition-colors
                            group-hover:bg-primary/60
                        " />
                    </div>

                    <div
                        ref={mapPanelRef}
                        className="
                            isolate hidden shrink-0 overflow-hidden border-l
                            lg:block
                        "
                        style={{ width: MAP_DEFAULT_WIDTH }}
                    >
                        <OpportunitiesMap opportunities={opportunities} />
                    </div>
                </div>
            </div>

            <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DialogContent className="
                    max-h-[85vh] overflow-y-auto
                    sm:max-w-sm
                ">
                    <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                    </DialogHeader>
                    <FiltersContent {...filterProps} onClose={() => setFiltersOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent className="
                    flex h-[80vh] max-w-full flex-col p-0
                    sm:max-w-2xl
                ">
                    <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
                        <DialogTitle>Map</DialogTitle>
                    </DialogHeader>
                    <div className="isolate min-h-0 flex-1">
                        <OpportunitiesMap opportunities={opportunities} />
                    </div>
                </DialogContent>
            </Dialog>

            <div className="relative z-50">
                <OpportunityDetailModal
                    opp={selectedOpp}
                    matchPct={selectedOpp ? getMatchPct(selectedOpp) : 0}
                    hasApplied={selectedOpp ? appliedOppIds.has(selectedOpp.id) : false}
                    onClose={() => setSelectedOpp(null)}
                    onApply={handleApply}
                />
                <ApplyModal
                    open={applyModalOpen}
                    oppName={selectedOpp?.name ?? ""}
                    onClose={() => setApplyModalOpen(false)}
                    onSubmit={submitApplication}
                />
            </div>
        </div>
    );
}
