import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import { OrganizationService } from "@/services/OrganizationService";
import type { CurrentModerator, Organization } from "@volunteerly/shared";

export function useOrgListViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(undefined);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);

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
        if (!loading && !session) {
            router.replace("/login");
        }
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

                const orgsResult = await OrganizationService.getAllOrganizations("APPLIED");
                if (!orgsResult.success) {
                    setError("Failed to load organizations.");
                    return;
                }

                setOrganizations(orgsResult.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setLoadingData(false);
            }
        }
        load();
    }, [session, router]);

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
        if (!result.success) {
            setError("Failed to approve organization.");
            return;
        }

        setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg.id));
        closeReviewModal();
        showToast("Organization Approved");
    }

    async function handleReject() {
        if (!selectedOrg || !rejectionReason.trim()) return;

        const result = await OrganizationService.rejectOrganization(selectedOrg.id, rejectionReason);
        if (!result.success) {
            setError("Failed to reject organization.");
            return;
        }

        setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg.id));
        closeReviewModal();
        showToast("Organization Rejected");
    }

    return {
        loading: loading || loadingData,
        session,
        signOut,
        router,
        currentModerator,
        organizations,
        error,
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