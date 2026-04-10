/**
 * page.tsx
 * Opportunities browse page - lists available opportunities with filters, search, sort, and a resizable map
 */
"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApplyModal } from "@/components/volunteer/apply-modal";
import { OpportunityCard } from "@/components/volunteer/opportunity-card";
import { OpportunityDetailModal } from "@/components/volunteer/opportunity-detail-modal";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Map, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import {
    OPPORTUNITY_CATEGORIES,
    useOpportunitiesViewModel,
    type CommitmentFilter,
    type SortOption,
    type WorkTypeFilter,
} from "./opportunitiesVm";

// Leaflet needs the DOM, so we load the map component client-side only
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
    FLEXIBLE: "Flexible (2–5 hrs)",
    PART_TIME: "Part-Time (5–20 hrs)",
    FULL_TIME: "Full-Time (20+ hrs)",
};

const SORT_LABELS: Record<SortOption, string> = {
    MATCH_HIGH: "Best Match",
    MATCH_LOW: "Lowest Match",
    NEWEST: "Newest",
};

// Map panel sizing constraints for the drag-to-resize handle
const MAP_MIN_WIDTH = 200;
const MAP_MAX_WIDTH = 800;
const MAP_DEFAULT_WIDTH = 420;

/**
 * Shared filter UI rendered in both the sidebar (desktop) and the mobile filter dialog
 */
function FiltersContent({
    selectedCategories,
    toggleCategory,
    workType,
    setWorkType,
    commitmentLevel,
    setCommitmentLevel,
}: {
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    workType: WorkTypeFilter;
    setWorkType: (v: WorkTypeFilter) => void;
    commitmentLevel: CommitmentFilter;
    setCommitmentLevel: (v: CommitmentFilter) => void;
    onClose?: () => void;
}) {
    return (
        <>
            {/* Role / category checkboxes */}
            <div className="mb-6">
                <p
                    className="
                        mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground
                    "
                >
                    Roles
                </p>
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

            {/* Work type toggle pills - clicking the active one resets to ALL */}
            <div className="mb-6">
                <p
                    className="
                        mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground
                    "
                >
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

            {/* Commitment level toggle pills - same toggle-off behaviour as work type */}
            <div className="mb-6">
                <p
                    className="
                        mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground
                    "
                >
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
        </>
    );
}

export default function OpportunitiesPage() {
    const {
        loading,
        session,
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
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        toggleCategory,
        getMatchPct,
        handleApply,
        applyModalOpen,
        setApplyModalOpen,
        submitApplication,
        appliedOppIds,
    } = useOpportunitiesViewModel();

    // Mobile-only dialogs for filters and map
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);

    // Refs used by the drag-to-resize map panel handle
    const mapWidthRef = useRef<number>(MAP_DEFAULT_WIDTH);
    const mapPanelRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    /**
     * Handles the mousedown event on the resize handle, then tracks mousemove/mouseup globally
     * We attach to window so the drag still works if the cursor leaves the handle element
     */
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const onMouseMove = (ev: MouseEvent) => {
            if (!isDragging.current || !mapPanelRef.current) return;
            // Calculate width from the right edge of the window
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

    // Bundle filter props so we can spread them into both the sidebar and the mobile dialog
    const filterProps = {
        selectedCategories,
        toggleCategory,
        workType,
        setWorkType,
        commitmentLevel,
        setCommitmentLevel,
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
                {/* Desktop filter sidebar - hidden on mobile */}
                <aside
                    className="
                        hidden w-56 shrink-0 overflow-y-auto border-r bg-card p-5
                        lg:block
                    "
                >
                    <p className="mb-5 text-sm font-semibold text-foreground">= Filters</p>
                    <FiltersContent {...filterProps} />
                </aside>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* Top bar: count, search, mobile buttons, sort dropdown */}
                        <div className="shrink-0 border-b bg-card px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <h1 className="font-bold text-foreground">
                                    {oppCount} {oppCount === 1 ? "Opportunity" : "Opportunities"}{" "}
                                    Found
                                </h1>
                                <input
                                    type="text"
                                    placeholder="Search opportunities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="
                                        hidden rounded-lg border bg-muted px-3 py-1.5 text-sm
                                        text-foreground
                                        placeholder:text-muted-foreground
                                        focus:outline-none focus:ring-2 focus:ring-ring
                                        sm:block sm:w-56
                                    "
                                />
                                <div className="flex items-center gap-2">
                                    {/* These buttons are only visible on smaller screens */}
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

                                    <div
                                        className="
                                            flex items-center gap-1.5 text-sm text-muted-foreground
                                        "
                                    >
                                        <ArrowUpDown className="size-3.5 shrink-0" />
                                        <span
                                            className="
                                                hidden
                                                sm:inline
                                            "
                                        >
                                            Sort:
                                        </span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(e.target.value as SortOption)
                                            }
                                            className="
                                                cursor-pointer rounded-md border-0 bg-transparent
                                                py-0 pr-6 text-sm font-medium text-foreground
                                                focus:outline-none focus:ring-0
                                            "
                                        >
                                            {(Object.keys(SORT_LABELS) as SortOption[]).map(
                                                (opt) => (
                                                    <option key={opt} value={opt}>
                                                        {SORT_LABELS[opt]}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="
                                    mx-5 mt-4 rounded-xl border border-destructive/20
                                    bg-destructive/10 px-4 py-2 text-sm text-destructive
                                "
                            >
                                {error}
                            </div>
                        )}

                        {/* Scrollable opportunity list */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {opportunities.length === 0 ? (
                                <div
                                    className="
                                        flex h-40 items-center justify-center text-sm
                                        text-muted-foreground
                                    "
                                >
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
                                        // Clicking the same card again deselects it
                                        onClick={() =>
                                            setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Drag handle - only visible on desktop alongside the map panel */}
                    <div
                        onMouseDown={onMouseDown}
                        className="
                            hidden
                            lg:flex
                            w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-border
                            hover:bg-primary/40
                            transition-colors group
                        "
                        title="Drag to resize map"
                    >
                        <div
                            className="
                                h-8 w-0.5 rounded-full bg-muted-foreground/30
                                group-hover:bg-primary/60
                                transition-colors
                            "
                        />
                    </div>

                    {/* Map panel - starts at MAP_DEFAULT_WIDTH and resizes via the drag handle */}
                    <div
                        ref={mapPanelRef}
                        className="
                            hidden
                            lg:block
                            shrink-0 overflow-hidden border-l isolate
                        "
                        style={{ width: MAP_DEFAULT_WIDTH }}
                    >
                        <OpportunitiesMap opportunities={opportunities} />
                    </div>
                </div>
            </div>

            {/* Mobile filter dialog */}
            <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DialogContent
                    className="
                        max-h-[85vh] overflow-y-auto
                        sm:max-w-sm
                    "
                >
                    <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                    </DialogHeader>
                    <FiltersContent {...filterProps} onClose={() => setFiltersOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Mobile map dialog */}
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent
                    className="
                        flex flex-col h-[80vh] max-w-full p-0
                        sm:max-w-2xl
                    "
                >
                    <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
                        <DialogTitle>Map</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 isolate">
                        <OpportunitiesMap opportunities={opportunities} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Detail modal and apply modal - rendered at the top of the stacking context */}
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
