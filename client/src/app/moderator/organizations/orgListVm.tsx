import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import { OrganizationService } from "@/services/OrganizationService";
import type { CurrentModerator, Organization } from "@volunteerly/shared";

export type TabKey = "ALL" | "APPLIED" | "VERIFIED" | "REJECTED";
export type SortKey = "alphabetical" | "newest" | "oldest";

const PAGE_SIZE_OPTIONS = [3, 5, 10] as const;

export function useOrgListViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(undefined);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    const [activeTab, setActiveTab] = useState<TabKey>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingSearch, setPendingSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("alphabetical");
    const [pendingSort, setPendingSort] = useState<SortKey>("alphabetical");
    const [pageSize, setPageSize] = useState<number>(3);
    const [pendingPageSize, setPendingPageSize] = useState<number>(3);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [checks, setChecks] = useState({
        charityVerified: false,
        websiteMatches: false,
        documentsValid: false,
        addressConfirmed: false,
    });
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

    const allChecked = Object.values(checks).every(Boolean);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;
            try {
                const userResult = await UserService.getCurrentUser();
                if (!userResult.success || userResult.data.role !== "MODERATOR") {
                    router.replace("/bootstrap");
                    return;
                }

                const modResult = await ModeratorService.getCurrentModerator();
                if (modResult.success) setCurrentModerator(modResult.data);

                const orgsResult = await OrganizationService.getAllOrganizations();
                if (!orgsResult.success) {
                    setError("Failed to load organizations.");
                    return;
                }
                setAllOrgs(orgsResult.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setLoadingData(false);
            }
        }
        load();
    }, [session, router]);

    const tabCounts = useMemo(() => ({
        ALL: allOrgs.length,
        APPLIED: allOrgs.filter((o) => o.status === "APPLIED").length,
        VERIFIED: allOrgs.filter((o) => o.status === "VERIFIED").length,
        REJECTED: allOrgs.filter((o) => o.status === "REJECTED").length,
    }), [allOrgs]);

    const filteredOrgs = useMemo(() => {
        let orgs = allOrgs;

        if (activeTab !== "ALL") {
            orgs = orgs.filter((o) => o.status === activeTab);
        }

        if (searchQuery.trim()) {
            orgs = orgs.filter((o) =>
                o.orgName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortBy === "alphabetical") {
            orgs = [...orgs].sort((a, b) => a.orgName.localeCompare(b.orgName));
        } else if (sortBy === "newest") {
            orgs = [...orgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === "oldest") {
            orgs = [...orgs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        return orgs;
    }, [allOrgs, activeTab, searchQuery, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / pageSize));
    const paginatedOrgs = filteredOrgs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    function applyFilters() {
        setSearchQuery(pendingSearch);
        setSortBy(pendingSort);
        setPageSize(pendingPageSize);
        setCurrentPage(1);
    }

    function handleTabChange(tab: TabKey) {
        setActiveTab(tab);
        setCurrentPage(1);
    }

    function openReviewModal(org: Organization) {
        setSelectedOrg(org);
        setChecks({ charityVerified: false, websiteMatches: false, documentsValid: false, addressConfirmed: false });
        setShowRejectModal(false);
        setRejectionReason("");
    }

    function closeReviewModal() {
        setSelectedOrg(null);
        setShowRejectModal(false);
    }

    function toggleCheck(key: keyof typeof checks) {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function showToast(message: string) {
        setToast({ message, visible: true });
        setTimeout(() => setToast({ message: "", visible: false }), 3000);
    }

    async function handleApprove() {
        if (!selectedOrg || !allChecked) return;
        const result = await OrganizationService.approveOrganization(selectedOrg.id);
        if (!result.success) { setError("Failed to approve organization."); return; }
        setAllOrgs((prev) => prev.map((o) => o.id === selectedOrg.id ? { ...o, status: "VERIFIED" as const } : o));
        closeReviewModal();
        showToast("Organization Approved");
    }

    async function handleReject() {
        if (!selectedOrg || !rejectionReason.trim()) return;
        const result = await OrganizationService.rejectOrganization(selectedOrg.id, rejectionReason);
        if (!result.success) { setError("Failed to reject organization."); return; }
        setAllOrgs((prev) => prev.map((o) => o.id === selectedOrg.id ? { ...o, status: "REJECTED" as const } : o));
        closeReviewModal();
        showToast("Organization Rejected");
    }

    return {
        loading: loading || loadingData,
        session,
        signOut,
        router,
        currentModerator,
        paginatedOrgs,
        filteredOrgs,
        error,
        activeTab,
        tabCounts,
        pendingSearch,
        setPendingSearch,
        pendingSort,
        setPendingSort,
        pendingPageSize,
        setPendingPageSize,
        pageSize,
        PAGE_SIZE_OPTIONS,
        currentPage,
        totalPages,
        setCurrentPage,
        applyFilters,
        handleTabChange,
        selectedOrg,
        checks,
        allChecked,
        showRejectModal,
        rejectionReason,
        toast,
        openReviewModal,
        closeReviewModal,
        toggleCheck,
        setShowRejectModal,
        setRejectionReason,
        handleApprove,
        handleReject,
    };
}