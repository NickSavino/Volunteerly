import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { ModeratorService } from "@/services/ModeratorService";
import { OrganizationService } from "@/services/OrganizationService";
import type { CurrentModerator, ModeratorOrganizationList, ModeratorOrganizationListItem } from "@volunteerly/shared";
import { appToast } from "@/components/common/app-toast";

export type TabKey = "ALL" | "APPLIED" | "VERIFIED" | "REJECTED";
export type SortKey = "alphabetical" | "newest" | "oldest";

export const ORG_TABS: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "All Accounts" },
    { key: "APPLIED", label: "Flagged Accounts" },
    { key: "VERIFIED", label: "Resolved" },
    { key: "REJECTED", label: "Closed" },
];

const PAGE_SIZE_OPTIONS = [3, 5, 10] as const;

export function useOrgListViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();

    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(undefined);
    const [allOrgs, setAllOrgs] = useState<ModeratorOrganizationList>([]);
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

    const [selectedOrg, setSelectedOrg] = useState<ModeratorOrganizationListItem | null>(null);
    const [checks, setChecks] = useState({
        charityVerified: false,
        websiteMatches: false,
        documentsValid: false,
        addressConfirmed: false,
    });

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const allChecked = Object.values(checks).every(Boolean);

    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;
            try {
                const modResult = await ModeratorService.getCurrentModerator();
                if (modResult.success) setCurrentModerator(modResult.data);

                const orgsResult = await OrganizationService.getAllOrganizations();
                if (!orgsResult) {
                    setError("Failed to load organizations.");
                    return;
                }
                setAllOrgs(orgsResult);
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setLoadingData(false);
            }
        }
        load();
    }, [session, router]);

    const tabCounts = useMemo(
        () => ({
            ALL: allOrgs.length,
            APPLIED: allOrgs.filter((o) => o.status === "APPLIED").length,
            VERIFIED: allOrgs.filter((o) => o.status === "VERIFIED").length,
            REJECTED: allOrgs.filter((o) => o.status === "REJECTED").length,
        }),
        [allOrgs],
    );

    const filteredOrgs = useMemo(() => {
        let orgs = allOrgs;

        if (activeTab !== "ALL") {
            orgs = orgs.filter((o) => o.status === activeTab);
        }

        if (searchQuery.trim()) {
            orgs = orgs.filter((o) => o.orgName.toLowerCase().includes(searchQuery.toLowerCase()));
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

    const startItem = filteredOrgs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredOrgs.length);

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

    function openReviewModal(org: ModeratorOrganizationListItem) {
        setSelectedOrg(org);
        setChecks({ charityVerified: false, websiteMatches: false, documentsValid: false, addressConfirmed: false });
        setShowRejectModal(false);
        setShowApproveConfirm(false);
        setRejectionReason("");
    }

    function closeReviewModal() {
        setSelectedOrg(null);
        setShowRejectModal(false);
        setShowApproveConfirm(false);
        setRejectionReason("");
    }

    function toggleCheck(key: keyof typeof checks) {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function requestApprove() {
        if (!selectedOrg || !allChecked) return;
        setShowApproveConfirm(true);
    }

    async function handleApprove() {
        if (!selectedOrg || !allChecked) return;
        try {
            const result = await OrganizationService.approveOrganization(selectedOrg.id);
            if (!result.success) {
                setError("Failed to approve organization.");
                return;
            }
            setAllOrgs((prev) =>
                prev.map((o) => (o.id === selectedOrg.id ? { ...o, status: "VERIFIED" as const } : o)),
            );
            closeReviewModal();
            appToast.success("Organization approved", {
                message: `${result.data.orgName} has been approved.`,
            });
        } catch {
            appToast.error("Rejection Failed", {
                message: "The organization could not be rejected.",
            });
        }
    }

    async function handleReject() {
        if (!selectedOrg || !rejectionReason.trim()) return;
        try {
            const result = await OrganizationService.rejectOrganization(selectedOrg.id, rejectionReason);
            if (!result.success) {
                setError("Failed to reject organization.");
                return;
            }
            setAllOrgs((prev) =>
                prev.map((o) => (o.id === selectedOrg.id ? { ...o, status: "REJECTED" as const } : o)),
            );
            closeReviewModal();

            appToast.success("Organization approved", {
                message: `${result.data.orgName} has been rejected.`,
            });
        } catch {
            appToast.error("Rejection Failed", {
                message: "The organization could not be rejected.",
            });
        }
    }

    return {
        auth: {
            loading: loading || loadingData,
            session,
            signOut,
            router,
            currentModerator,
        },
        page: {
            title: "Organizations",
            subtitle: "Review and Approve Organizations",
            activeTab,
            tabCounts,
            error,
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
            rows: paginatedOrgs,
            isEmpty: paginatedOrgs.length === 0,
        },
        pagination: {
            currentPage,
            totalPages,
            setCurrentPage,
            startItem,
            endItem,
            totalItems: filteredOrgs.length,
        },
        review: {
            selectedOrg,
            checks,
            allChecked,
            showRejectModal,
            showApproveConfirm,
            rejectionReason,
            openReviewModal,
            closeReviewModal,
            toggleCheck,
            setShowRejectModal,
            setShowApproveConfirm,
            setRejectionReason,
            handleApprove,
            handleReject,
            requestApprove,
        },
    };
}
