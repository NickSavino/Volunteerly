import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentOrganizationUpdate } from "@volunteerly/shared";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";
import { useAppSession } from "@/providers/app-session-provider";

export function useOrgProfileViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [originalOrg, setOriginalOrg] = useState<CurrentOrganization | undefined>(undefined);
    const [currentOrg, setCurrentOrg] = useState<CurrentOrganization | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);
    const [awards, setAwards] = useState<Record<string, string>>({});
    const [reviewSummary, setReviewSummary] = useState({
        avgRating: 0,
        totalReviews: 0,
    });
    const [impactHighlights, setImpactHighlights] = useState({
        first: { label: "", value: "" },
        second: { label: "", value: "" },
    });
    const [address, setAddress] = useState({
        streetAdr: "",
        city: "",
        province: "AB",
        postalCode: "",
    });
    const [editing, setEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { refresh } = useAppSession();

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
                setCurrentOrg(org.data);
                setOriginalOrg(org.data);
                const adrData = org.data.hqAdr?.split(", ") || [];
                setAddress({
                    streetAdr: adrData[0] || "",
                    city: adrData[1] || "",
                    province: adrData[2] || "AB",
                    postalCode: adrData[3] || "",
                });
                if (org.data.impactHighlights && org.data.impactHighlights.length >= 2) {
                    setImpactHighlights({
                        first: {
                            label: Object.keys(org.data.impactHighlights[0])[0],
                            value: org.data.impactHighlights[0][Object.keys(org.data.impactHighlights[0])[0]],
                        },
                        second: {
                            label: Object.keys(org.data.impactHighlights[1])[0],
                            value: org.data.impactHighlights[1][Object.keys(org.data.impactHighlights[1])[0]],
                        },
                    });
                }

                const awardsFetch = await OrganizationService.getOrgAwards();
                if (awardsFetch.success) {
                    setAwards(awardsFetch.data);
                }

                const reviewsFetch = await OrganizationService.getReviewSummary();
                if (reviewsFetch.success) {
                    setReviewSummary(reviewsFetch.data);
                }
                setFetching(false);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load Organization Details.", { position: "top-right" });
                return;
            }
        }
        loadCurrentUser();
    }, [session, router, fetching]);

    async function viewSubmittedDoc() {
        if (currentOrg?.docId) {
            try {
                const fileBlob = await OrganizationService.getOrganizationDocument(currentOrg.docId);

                const url = URL.createObjectURL(fileBlob);
                const newWindow = window.open(url, "_blank");
                const interval = setInterval(() => {
                    if (newWindow?.closed) {
                        clearInterval(interval);
                        URL.revokeObjectURL(url);
                    }
                }, 2000);
            } catch (error) {
                console.error("Failed to load document", error);
                toast.error("Failed to load document.", { position: "top-right" });
            }
        }
        return;
    }
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editing || !currentOrg) {
            return;
        }

        setFetching(true);
        setError(null);

        const hqAdr = `${address.streetAdr}, ${address.city}, ${address.province}, ${address.postalCode}`;
        const updateOrg: CurrentOrganizationUpdate = {
            ...currentOrg,
            hqAdr: hqAdr,
            impactHighlights: [
                {
                    [impactHighlights.first.label]: impactHighlights.first.value,
                },
                {
                    [impactHighlights.second.label]: impactHighlights.second.value,
                },
            ],
        };

        const updated = await OrganizationService.update_create_Organization(updateOrg);

        if (updated.success) {
            setEditing(false);
            toast.success("Profile Updated!", { position: "top-right" });
        } else {
            setError("Could Not Update Organization.");
            toast.error("Error updating Profile.", { position: "top-right" });
        }
        setFetching(false);
        return;
    }

    async function resetEdit() {
        if (originalOrg) {
            setCurrentOrg(originalOrg);
            const adrData = originalOrg.hqAdr?.split(", ") || [];
            setAddress({
                streetAdr: adrData[0] || "",
                city: adrData[1] || "",
                province: adrData[2] || "AB",
                postalCode: adrData[3] || "",
            });
            if (originalOrg.impactHighlights && originalOrg.impactHighlights.length >= 2) {
                setImpactHighlights({
                    first: {
                        label: Object.keys(originalOrg.impactHighlights[0])[0],
                        value: originalOrg.impactHighlights[0][Object.keys(originalOrg.impactHighlights[0])[0]],
                    },
                    second: {
                        label: Object.keys(originalOrg.impactHighlights[1])[0],
                        value: originalOrg.impactHighlights[1][Object.keys(originalOrg.impactHighlights[1])[0]],
                    },
                });
            } else {
                setImpactHighlights({
                    first: { label: "", value: "" },
                    second: { label: "", value: "" },
                });
            }
        }
        setEditing(false);
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newAvatar = e.target.files?.[0];
        setFetching(true);
        if (!newAvatar) {
            return;
        }

        const formData = new FormData();
        formData.append("image", newAvatar);

        const path = await UserService.uploadAvatar(formData);
        if (path) {
            toast.success("Avatar Updated!", { position: "top-right" });
            await refresh();
        } else {
            toast.error("Error updating Avatar.", { position: "top-right" });
        }
        setFetching(false);
    }
    return {
        loading,
        session,
        fetching,
        signOut,
        router,
        user,
        error,
        reviewSummary,
        currentOrg,
        setCurrentOrg,
        address,
        viewSubmittedDoc,
        editing,
        setEditing,
        handleSubmit,
        setAddress,
        resetEdit,
        impactHighlights,
        setImpactHighlights,
        fileInputRef,
        handleAvatarChange,
        awards,
    };
}
