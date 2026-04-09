import { useAuth } from "@/providers/auth-provider";
import { OrganizationService } from "@/services/OrganizationService";
import { Application, CurrentOrganization, Opportunity, ProgressUpdate } from "@volunteerly/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOrgViewOpportunityViewModel(id: string) {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [opportunity, setOpportunity] = useState<Opportunity>();
    const [totalHours, setTotalHours] = useState(0);
    const [monetaryValue, setMonetaryValue] = useState(0);
    const [applications, setApplications] = useState<Application[]>([]);
    const [fetching, setFetching] = useState(true);
    const [reload, setReload] = useState(false);
    const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
        title: "",
        description: "",
        hoursContributed: 0,
    });
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadCurrentUser() {
            if (!session?.access_token) return;
            try {
                const org = await OrganizationService.getCurrentOrganization();

                if (!org.success) {
                    console.error(org.error);
                    setError("Received invalid user data from the server.");
                    toast.error("Failed to load Organization.", { position: "top-right" });
                    return;
                }
                if (org.data.status == "CREATED") {
                    router.replace("/organization/application");
                    return;
                } else if (org.data.status == "APPLIED") {
                    router.replace("/organization/appliedDashboard");
                    return;
                }
                setCurrentUser(org.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load Organization.", { position: "top-right" });
                return;
            }
        }
        loadCurrentUser();
    }, [session, router]);

    useEffect(() => {
        async function loadOpportunities() {
            setFetching(true);
            const opp = await OrganizationService.getOpportunity(id);
            if (!opp.success) {
                console.error(opp.error);
                setError("Failed to load Opportunity.");
                toast.error("Failed to load Opportunity.", { position: "top-right" });
                return;
            }

            setOpportunity(opp.data);

            if (opp.data.status == "OPEN") {
                const apps = await OrganizationService.getApplications(opp.data.id);
                if (!apps.success) {
                    console.error(apps.error);
                    setError("Failed to load Applications.");
                    toast.error("Failed to load Applications.", { position: "top-right" });
                    setFetching(false);
                    return;
                }
                setApplications(apps.data);
            }

            if (opp.data.status == "CLOSED") {
                const analytics = await OrganizationService.getOpportunityAnalytics(opp.data.id);
                if (analytics.success) {
                    setTotalHours(analytics.data?.hours);
                    setMonetaryValue(analytics.data?.value);
                }
            }

            setFetching(false);
            setReload(false);
        }
        loadOpportunities();
    }, [id, reload]);

    async function completeOpportunity() {
        if (opportunity?.status == "FILLED") {
            const completed_opp = await OrganizationService.completeOpportunity(opportunity.id);
            if (completed_opp.success) {
                toast.success("Opportunity completed!", { position: "top-right" });
                setReload(true);
                return;
            }
        }
        toast.error("Failed to complete Opportunity.", { position: "top-right" });
        setError("Cannot Complete Opportunity");
    }
    async function addUpdate() {
        if (progressUpdate) {
            setFetching(true);
            const payload = {
                ...progressUpdate,
                opportunityId: opportunity?.id,
            };
            const updated = await OrganizationService.addProgressUpdate(payload);
            if (updated.success) {
                toast.success("Progress Updated Added!", { position: "top-right" });
                setProgressUpdate({
                    title: "",
                    description: "",
                    hoursContributed: 0,
                });
                setReload(true);
                setFetching(false);
                return;
            } else {
                toast.error("Failed to add Progress Update.", { position: "top-right" });
                setFetching(false);
            }
        }
    }

    async function submitReview(input: { rating: number; flagged: boolean; flagReason?: string }) {
        if (submitting || !opportunity?.volunteer?.id) return;
        setSubmitting(true);
        try {
            await OrganizationService.postReview(
                opportunity.volunteer.id,
                opportunity.id,
                input.rating,
            );
        } catch (err) {
            setReviewModalOpen(false);
            setSubmitting(false);
            let msg = "Failed to post review. Please try again.";
            try {
                const body = JSON.parse(err instanceof Error ? err.message : "");
                if (body?.error?.toLowerCase().includes("already")) {
                    msg = "You have already reviewed this volunteer for this opportunity.";
                }
            } catch {}
            toast.error(msg, { position: "top-right" });
            return;
        }
        if (input.flagged && input.flagReason?.trim()) {
            try {
                await OrganizationService.postFlag(
                    opportunity.volunteer.id,
                    opportunity.id,
                    input.flagReason.trim(),
                );
            } catch {
                setReviewModalOpen(false);
                setSubmitting(false);
                toast.error("Review posted, but the flag failed to submit. Please try again.", {
                    position: "top-right",
                });
                return;
            }
        }
        setReviewModalOpen(false);
        setSubmitting(false);
        toast.success(input.flagged ? "Review and flag posted!" : "Review posted!", {
            position: "top-right",
        });
    }

    return {
        loading,
        fetching,
        session,
        signOut,
        router,
        user,
        error,
        currentUser,
        opportunity,
        applications,
        completeOpportunity,
        totalHours,
        monetaryValue,
        setProgressUpdate,
        addUpdate,
        reviewModalOpen,
        setReviewModalOpen,
        submitting,
        submitReview,
    };
}
