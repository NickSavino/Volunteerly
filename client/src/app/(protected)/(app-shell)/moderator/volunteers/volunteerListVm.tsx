import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ModeratorVolunteerListItem, VolunteerModerationTab } from "@volunteerly/shared";
import { useAuth } from "@/providers/auth-provider";
import { ModeratorService } from "@/services/ModeratorService";

export type VolunteerSortKey = "alphabetical" | "highest-flags" | "highest-rating";

export const VOLUNTEER_TABS: { key: VolunteerModerationTab; label: string }[] = [
  { key: "ALL", label: "All Accounts" },
  { key: "FLAGGED", label: "Flagged Accounts" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

const PAGE_SIZE_OPTIONS = [3, 5, 10] as const;


export function useVolunteerListViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();

    const [volunteersList, setVolunteersList] = useState<ModeratorVolunteerListItem[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<VolunteerModerationTab>("ALL")
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingSearch, setPendingSearch] = useState("");
    const [sortBy, setSortBy] = useState<VolunteerSortKey>("alphabetical");
    const [pendingSort, setPendingSort] = useState<VolunteerSortKey>("alphabetical");
    const [pageSize, setPageSize] = useState<number>(3);
    const [pendingPageSize, setPendingPageSize] = useState<number>(3);
    const [currentPage, setCurrentPage] = useState(1);

    const accessToken = session?.access_token;

    const loadVolunteers = useCallback(async () => {
            if (!accessToken) return;
            
            setLoadingData(true);
            try {
                const volunteers = await ModeratorService.getModeratorVolunteers();
                setVolunteersList(volunteers);
                setError(null);
            } catch {
                setError("Failed to load volunteers.");
            } finally {
                setLoadingData(false);
            }
        }, [accessToken]);

    useEffect(() => {

        void loadVolunteers();
    }, [loadVolunteers]);

    const tabCounts = useMemo(
        () => ({
            ALL: volunteersList.length,
            FLAGGED: volunteersList.filter((v) => v.state === "FLAGGED").length,
            RESOLVED: volunteersList.filter((v) => v.state === "RESOLVED").length,
            CLOSED: volunteersList.filter((v) => v.state === "CLOSED").length,
        }),
        [volunteersList]
    );

    const filteredVolunteers = useMemo(() => {
        let rows = volunteersList;

        if (activeTab !== "ALL") {
            rows = rows.filter((v) => v.state == activeTab)
        }

        if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        rows = rows.filter((v) =>
            `${v.firstName} ${v.lastName}`.toLowerCase().includes(q)
        )}

        if (sortBy === "alphabetical") {
            rows = [...rows].sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        )} else if (sortBy === "highest-flags") {
            rows = [...rows].sort((a , b) => b.pastFlagsCount - a.pastFlagsCount);
        } else if (sortBy === "highest-rating") {
            rows = [...rows].sort((a, b) => b.averageRating - a.averageRating);
        }

        return rows;
    }, 
    [volunteersList, activeTab, searchQuery, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredVolunteers.length / pageSize));
    const paginatedVolunteers = filteredVolunteers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const startItem = filteredVolunteers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredVolunteers.length);

    function applyFilters() {
        setSearchQuery(pendingSearch);
        setSortBy(pendingSort);
        setPageSize(pendingPageSize);
        setCurrentPage(1);
    }

    function handleTabChange(tab: VolunteerModerationTab) {
        setActiveTab(tab);
        setCurrentPage(1);
    }

    return {
        auth: {
            loading: loading || loadingData,
            session,
            signOut,
            router
        },
        page: {
            title: "Volunteers",
            subtitle: "Manage Volunteers",
            activeTab,
            tabCounts,
            error,
            refreshVolunteers: loadVolunteers
        },
        filters: {
            pendingSearch,
            setPendingSearch,
            pendingSort,
            setPendingSort,
            pendingPageSize,
            setPendingPageSize,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            applyFilters,
            handleTabChange,
        },
        data: {
            rows: paginatedVolunteers,
            isEmpty: paginatedVolunteers.length === 0,
        },
        pagination: {
            currentPage,
            totalPages,
            setCurrentPage,
            startItem,
            endItem,
            totalItems: volunteersList.length
        }
    }

}