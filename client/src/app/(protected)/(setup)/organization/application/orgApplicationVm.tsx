/**
 * orgApplicationVm.tsx
 * View model for the organization's verification application form
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentOrganizationUpdateSchema } from "@volunteerly/shared";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";
import { useAppSession } from "@/providers/app-session-provider";

export function useOrgApplicationViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const { refresh } = useAppSession();
    const [currentOrg, setCurrentOrg] = useState<CurrentOrganization>();
    const [address, setAddress] = useState({
        streetAdr: "",
        city: "",
        province: "AB",
        postalCode: "",
    });
    const [file, setFile] = useState<File | null>();
    const [error, setError] = useState<string | null>(null);
    const [bootstrapping, setBootStrapping] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // On load, fetch the org's current state - if they've already applied, pre-fill the form
    // but mark it as read-only so they can view but not re-submit
    useEffect(() => {
        async function loadCurrentUser() {
            if (!session?.access_token || currentOrg) {
                setBootStrapping(false);
                return;
            }

            try {
                const org = await OrganizationService.getCurrentOrganization();

                if (!org.success) {
                    console.error(org.error);
                    setError("Received invalid user data from the server.");
                    return;
                }

                // Parse the stored address back into separate fields for the form
                const adrData = org.data.hqAdr?.split(", ") || [];
                setAddress({
                    streetAdr: adrData[0] || "",
                    city: adrData[1] || "",
                    province: adrData[2] || "AB",
                    postalCode: adrData[3] || "",
                });
                setCurrentOrg(org.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load organization.");
            } finally {
                setBootStrapping(false);
            }
        }
        loadCurrentUser();
    }, [session, currentOrg]);

    // Form is read-only once the application has been submitted or a decision has been made
    const isReadOnly =
        currentOrg?.status === "APPLIED" ||
        currentOrg?.status === "VERIFIED" ||
        currentOrg?.status === "REJECTED";

    // Submits the application form with all org details and the verification document
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isReadOnly || !currentOrg) {
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            // Merge the separate address fields back into one string before validation
            const createdOrg = CurrentOrganizationUpdateSchema.parse({
                ...currentOrg,
                hqAdr: `${address.streetAdr}, ${address.city}, ${address.province}, ${address.postalCode}`,
            });

            const formData = new FormData();

            if (!file) {
                setError("Please upload a verification document.");
                return;
            }

            formData.append("document", file);

            // Append all org fields to the form data for multipart submission
            Object.entries(createdOrg).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            const { data, error, success } = await OrganizationService.apply(formData);

            if (!success) {
                setError("Error submitting application.");
                console.error(error);
                return;
            }

            // Refresh the app session so the new org status is reflected app-wide
            await refresh();

            // If the org passed auto-approval, skip the waiting room entirely
            if (data.status == "VERIFIED") {
                toast.success("Application was automatically approved!", { position: "top-right" });
                router.replace("/organization");
                return;
            }
            toast.success("Application submitted, Awaiting moderator review", {
                position: "top-right",
            });
            router.replace("/organization/appliedDashboard");
        } catch (err) {
            console.error(err);
            setError("Error submitting application.");
        } finally {
            setSubmitting(false);
        }
    }

    // Downloads and opens the previously submitted verification document in a new tab
    async function viewSubmittedDoc() {
        if (currentOrg?.docId) {
            try {
                const fileBlob = await OrganizationService.getOrganizationDocument(
                    currentOrg.docId,
                );

                const url = URL.createObjectURL(fileBlob);
                const newWindow = window.open(url, "_blank");

                // Clean up the blob URL once the tab is closed to avoid memory leaks
                const interval = setInterval(() => {
                    if (newWindow?.closed) {
                        clearInterval(interval);
                        URL.revokeObjectURL(url);
                    }
                }, 2000);
            } catch (error) {
                console.error("Failed to load document", error);
            }
        }
        return;
    }

    return {
        loading,
        error,
        bootstrapping,
        submitting,
        currentOrg,
        file,
        isReadOnly,
        setFile,
        router,
        setCurrentOrg,
        signOut,
        handleSubmit,
        viewSubmittedDoc,
        address,
        setAddress,
    };
}