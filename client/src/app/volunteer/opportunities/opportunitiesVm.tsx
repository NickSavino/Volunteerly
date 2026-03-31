import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import { appToast } from "@/components/common/app-toast";
import type { CurrentVolunteer, Opportunity } from "@volunteerly/shared";

export type WorkTypeFilter = "ALL" | "REMOTE" | "IN_PERSON" | "HYBRID";
export type CommitmentFilter = "ALL" | "FLEXIBLE" | "PART_TIME" | "FULL_TIME";

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

export function useOpportunitiesViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(undefined);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [workType, setWorkType] = useState<WorkTypeFilter>("ALL");
    const [commitmentLevel, setCommitmentLevel] = useState<CommitmentFilter>("ALL");
    const [maxHours, setMaxHours] = useState<number>(40);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    const fetchOpportunities = useCallback(async (cats: string[], wt: WorkTypeFilter, cl: CommitmentFilter, mh: number, sq: string) => {
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

            setOpportunities(filtered);
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

                await fetchOpportunities([], "ALL", "ALL", 40, "");
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setLoadingData(false);
            }
        }
        load();
    }, [session, router, fetchOpportunities]);

    function toggleCategory(cat: string) {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    }

    function applyFilters() {
        fetchOpportunities(selectedCategories, workType, commitmentLevel, maxHours, searchQuery);
    }

    function getMatchPct(opp: Opportunity): number {
        const seed = opp.id.charCodeAt(0) + opp.id.charCodeAt(1);
        return 50 + (seed % 46);
    }

    async function handleApply() {
        if (!selectedOpp) return;
        appToast.success("Application Submitted", {
            message: `You applied to ${selectedOpp.name}`,
        });
        setSelectedOpp(null);
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
        toggleCategory,
        applyFilters,
        getMatchPct,
        handleApply,
    };
}