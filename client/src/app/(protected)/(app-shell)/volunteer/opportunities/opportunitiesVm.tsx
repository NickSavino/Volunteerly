"use client";

import { appToast } from "@/components/common/app-toast";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import type { CurrentVolunteer, Opportunity } from "@volunteerly/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type WorkTypeFilter = "ALL" | "REMOTE" | "IN_PERSON" | "HYBRID";
export type CommitmentFilter = "ALL" | "FLEXIBLE" | "PART_TIME" | "FULL_TIME";
export type SortOption = "MATCH_HIGH" | "MATCH_LOW" | "NEWEST";

export const OPPORTUNITY_CATEGORIES = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "UI/UX Design",
    "Mobile App Dev",
    "Web Dev",
    "Data Analytics",
    "Humanitarian",
    "Poverty",
    "Accounting",
    "IT",
    "Management",
] as const;

const DEFAULT_MATCH_PCT = 1;

function sortOpportunities(
    opps: Opportunity[],
    sort: SortOption,
    scoreMap: Record<string, number>,
): Opportunity[] {
    const arr = [...opps];
    const getScore = (opp: Opportunity) => scoreMap[opp.id] ?? DEFAULT_MATCH_PCT;
    switch (sort) {
        case "MATCH_HIGH":
            return arr.sort((a, b) => getScore(b) - getScore(a));
        case "MATCH_LOW":
            return arr.sort((a, b) => getScore(a) - getScore(b));
        case "NEWEST":
            return arr.sort(
                (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
            );
        default:
            return arr.sort((a, b) => getScore(b) - getScore(a));
    }
}

export function useOpportunitiesViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(
        undefined,
    );
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [matchScores, setMatchScores] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [appliedOppIds, setAppliedOppIds] = useState<Set<string>>(new Set());

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [workType, setWorkType] = useState<WorkTypeFilter>("ALL");
    const [commitmentLevel, setCommitmentLevel] = useState<CommitmentFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("MATCH_HIGH");
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    const fetchOpportunities = useCallback(
        async (
            cats: string[],
            wt: WorkTypeFilter,
            cl: CommitmentFilter,
            sq: string,
            sort: SortOption,
            scores: Record<string, number>,
            volunteer?: CurrentVolunteer,
        ) => {
            try {
                const result = await VolunteerService.browseOpportunities({
                    search: sq || undefined,
                    workType: wt !== "ALL" ? wt : undefined,
                    commitmentLevel: cl !== "ALL" ? cl : undefined,
                });

                if (!result.success) {
                    setError("Failed to load opportunities.");
                    return;
                }

                let filtered = result.data;

                if (cats.length > 0) {
                    filtered = filtered.filter((opp) =>
                        cats.some((cat) => opp.category.toLowerCase().includes(cat.toLowerCase())),
                    );
                }

                const userAvailability =
                    volunteer?.availability ?? currentVolunteer?.availability ?? [];
                if (userAvailability.length > 0) {
                    filtered = filtered.filter((opp) =>
                        opp.availability?.some((day) => userAvailability.includes(day)),
                    );
                }

                setOpportunities(sortOpportunities(filtered, sort, scores));
            } catch (err) {
                console.error(err);
                setError("Failed to load opportunities.");
            }
        },
        [],
    );

    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;
            try {
                const userResult = await UserService.getCurrentUser();
                if (!userResult.success || userResult.data.role !== "VOLUNTEER") {
                    router.replace("/bootstrap");
                    return;
                }

                const volResult = await VolunteerService.getCurrentVolunteer();
                let volunteer: CurrentVolunteer | undefined;
                if (volResult.success) {
                    setCurrentVolunteer(volResult.data);
                    volunteer = volResult.data;
                }

                const appliedIds = await VolunteerService.getAppliedOppIds();
                setAppliedOppIds(new Set(appliedIds));

                const scores = await VolunteerService.getOpportunityMatchScores();
                setMatchScores(scores);

                await fetchOpportunities([], "ALL", "ALL", "", "MATCH_HIGH", scores, volunteer);

                //backfill opps
                VolunteerService.backfillOpportunityVectors();
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setLoadingData(false);
            }
        }
        load();
    }, [session, router, fetchOpportunities]);

    useEffect(() => {
        setOpportunities((prev) => sortOpportunities(prev, sortBy, matchScores));
    }, [sortBy, matchScores]);

    function toggleCategory(cat: string) {
        const next = selectedCategories.includes(cat)
            ? selectedCategories.filter((c) => c !== cat)
            : [...selectedCategories, cat];
        setSelectedCategories(next);
        fetchOpportunities(
            next,
            workType,
            commitmentLevel,
            searchQuery,
            sortBy,
            matchScores,
            currentVolunteer,
        );
    }

    function handleSetWorkType(wt: WorkTypeFilter) {
        setWorkType(wt);
        fetchOpportunities(
            selectedCategories,
            wt,
            commitmentLevel,
            searchQuery,
            sortBy,
            matchScores,
            currentVolunteer,
        );
    }

    function handleSetCommitmentLevel(cl: CommitmentFilter) {
        setCommitmentLevel(cl);
        fetchOpportunities(
            selectedCategories,
            workType,
            cl,
            searchQuery,
            sortBy,
            matchScores,
            currentVolunteer,
        );
    }

    function handleSetSearchQuery(sq: string) {
        setSearchQuery(sq);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            fetchOpportunities(
                selectedCategories,
                workType,
                commitmentLevel,
                sq,
                sortBy,
                matchScores,
                currentVolunteer,
            );
        }, 300);
    }

    function getMatchPct(opp: Opportunity): number {
        return matchScores[opp.id] ?? DEFAULT_MATCH_PCT;
    }

    function handleApply() {
        if (!selectedOpp) return;
        setApplyModalOpen(true);
    }

    async function submitApplication(message: string) {
        if (!selectedOpp) return;
        try {
            await VolunteerService.applyToOpportunity(selectedOpp.id, message);
            setAppliedOppIds((prev) => new Set(prev).add(selectedOpp.id));
            appToast.success("Applied to Opportunity", {
                message: `Successfully applied to ${selectedOpp.name}`,
            });
            setApplyModalOpen(false);
            setSelectedOpp(null);
        } catch {
            appToast.error("Application Failed", {
                message: "Could not submit your application. You may have already applied.",
            });
        }
    }

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return {
        loading: loading || loadingData,
        session,
        handleSignOut,
        router,
        currentVolunteer,
        opportunities,
        error,
        oppCount: opportunities.length,
        selectedOpp,
        setSelectedOpp,
        selectedCategories,
        workType,
        setWorkType: handleSetWorkType,
        commitmentLevel,
        setCommitmentLevel: handleSetCommitmentLevel,
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        sortBy,
        setSortBy,
        toggleCategory,
        getMatchPct,
        handleApply,
        applyModalOpen,
        setApplyModalOpen,
        submitApplication,
        appliedOppIds,
    };
}
