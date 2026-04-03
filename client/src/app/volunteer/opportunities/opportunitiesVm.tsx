import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import { appToast } from "@/components/common/app-toast";
import type { CurrentVolunteer, Opportunity } from "@volunteerly/shared";

export type WorkTypeFilter = "ALL" | "REMOTE" | "IN_PERSON" | "HYBRID";
export type CommitmentFilter = "ALL" | "FLEXIBLE" | "PART_TIME" | "FULL_TIME";
export type SortOption = "RELEVANT" | "MATCH_HIGH" | "MATCH_LOW" | "HOURS_LOW" | "HOURS_HIGH" | "NEWEST";

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
] as const;

function getMatchPctStatic(opp: Opportunity): number {
    const seed = opp.id.charCodeAt(0) + opp.id.charCodeAt(1);
    return 50 + (seed % 46);
}

function sortOpportunities(opps: Opportunity[], sort: SortOption): Opportunity[] {
    const arr = [...opps];
    switch (sort) {
        case "MATCH_HIGH": return arr.sort((a, b) => getMatchPctStatic(b) - getMatchPctStatic(a));
        case "MATCH_LOW":  return arr.sort((a, b) => getMatchPctStatic(a) - getMatchPctStatic(b));
        case "HOURS_LOW":  return arr.sort((a, b) => a.hours - b.hours);
        case "HOURS_HIGH": return arr.sort((a, b) => b.hours - a.hours);
        case "NEWEST":     return arr.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        case "RELEVANT":
        default:           return arr.sort((a, b) => getMatchPctStatic(b) - getMatchPctStatic(a));
    }
}

export function useOpportunitiesViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(undefined);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [appliedOppIds, setAppliedOppIds] = useState<Set<string>>(new Set());

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [workType, setWorkType] = useState<WorkTypeFilter>("ALL");
    const [commitmentLevel, setCommitmentLevel] = useState<CommitmentFilter>("ALL");
    const [maxHours, setMaxHours] = useState<number>(40);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("RELEVANT");

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    const fetchOpportunities = useCallback(async (cats: string[], wt: WorkTypeFilter, cl: CommitmentFilter, mh: number, sq: string, sort: SortOption) => {
        try {
            const result = await VolunteerService.browseOpportunities({
                search: sq || undefined,
                workType: wt !== "ALL" ? wt : undefined,
                commitmentLevel: cl !== "ALL" ? cl : undefined,
                maxHours: mh < 40 ? mh : undefined,
            });

            if (!result.success) {
                setError("Failed to load opportunities.");
                return;
            }

            let filtered = result.data;
            if (cats.length > 0) {
                filtered = filtered.filter((opp) =>
                    cats.some((cat) => opp.category.toLowerCase().includes(cat.toLowerCase()))
                );
            }

            setOpportunities(sortOpportunities(filtered, sort));
        } catch (err) {
            console.error(err);
            setError("Failed to load opportunities.");
        }
    }, []);

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
                if (volResult.success) setCurrentVolunteer(volResult.data);

                const appliedIds = await VolunteerService.getAppliedOppIds();
                setAppliedOppIds(new Set(appliedIds));

                await fetchOpportunities([], "ALL", "ALL", 40, "", "RELEVANT");
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
        setOpportunities((prev) => sortOpportunities(prev, sortBy));
    }, [sortBy]);

    function toggleCategory(cat: string) {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    }

    function applyFilters() {
        fetchOpportunities(selectedCategories, workType, commitmentLevel, maxHours, searchQuery, sortBy);
    }

    function getMatchPct(opp: Opportunity): number {
        return getMatchPctStatic(opp);
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
    };
}