/**
 * volOppDetailVm.tsx
 * View model for the volunteer opportunity detail page — handles loading, modals, and all actions
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";
import { toast } from "sonner";
import type { Opportunity, CurrentVolunteer } from "@volunteerly/shared";

export type ProgressUpdateInput = {
    title: string;
    description: string;
    hoursContributed: number;
};

export type ReviewInput = {
    rating: number;
    flagged: boolean;
    flagReason?: string;
};

/**
 * Drives all state and actions on the volunteer opportunity detail page
 * @param oppId - the ID of the opportunity being viewed
 * @returns all state values and action handlers needed by the page component
 */
export function useVolOppDetailViewModel(oppId: string) {
    const router = useRouter();
    const { session, loading } = useAuth();

    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal open/close flags
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
    const [skillModalOpen, setSkillModalOpen] = useState(false);
    const [skillsAlreadySubmitted, setSkillsAlreadySubmitted] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    // Redirect to login if the session expires or is missing
    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    // Load the opportunity and volunteer data on mount
    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;
            try {
                // Fetch the volunteer profile and opportunity in parallel for speed
                const [volResult, oppResult] = await Promise.all([
                    VolunteerService.getCurrentVolunteer(),
                    VolunteerService.getOpportunityById(oppId),
                ]);

                if (!volResult.success) {
                    setError("Failed to load volunteer.");
                    return;
                }
                setCurrentVolunteer(volResult.data);

                if (!oppResult.success) {
                    setError("Failed to load opportunity.");
                    return;
                }
                setOpp(oppResult.data);

                // Check if skills have already been logged for this opportunity so we can disable the button
                const existingSkills = await VolunteerService.getOppSkills(oppId);
                if (existingSkills.length > 0) setSkillsAlreadySubmitted(true);
            } catch {
                setError("Failed to load data.");
            } finally {
                setPageLoading(false);
            }
        }
        load();
    }, [session, oppId]);

    /**
     * Submits a progress update for the opportunity and refreshes the opp data
     * @param input - title, description, and hours contributed
     */
    async function submitProgressUpdate(input: ProgressUpdateInput) {
        if (submitting) return;
        setSubmitting(true);
        try {
            await VolunteerService.addProgressUpdate(oppId, input);
            // Refresh the opportunity so the new update shows up immediately
            const result = await VolunteerService.getOpportunityById(oppId);
            if (result.success) setOpp(result.data);
            setProgressModalOpen(false);
        } catch {
            setError("Failed to submit progress update.");
        } finally {
            setSubmitting(false);
        }
    }

    /**
     * Posts a review (and optionally a flag) for the opportunity's organization
     * @param input - star rating, flag toggle, and flag reason
     */
    async function submitReview(input: ReviewInput) {
        if (submitting || !opp?.organization?.id) return;
        setSubmitting(true);
        try {
            await VolunteerService.postReview(opp.organization.id, oppId, { rating: input.rating });
        } catch (err) {
            setReviewModalOpen(false);
            setSubmitting(false);
            let msg = "Failed to post review. Please try again.";
            try {
                // Try to extract a more specific error message from the response body
                const body = JSON.parse(err instanceof Error ? err.message : "");
                if (body?.error?.toLowerCase().includes("already")) {
                    msg = "You have already reviewed this organization for this opportunity.";
                }
            } catch {}
            toast.error(msg);
            return;
        }

        // If the volunteer also flagged, submit that separately after the review
        if (input.flagged && input.flagReason?.trim()) {
            try {
                await VolunteerService.postFlag(
                    opp.organization.id,
                    oppId,
                    input.flagReason.trim(),
                );
            } catch {
                setReviewModalOpen(false);
                setSubmitting(false);
                toast.error("Review posted, but the flag failed to submit. Please try again.");
                return;
            }
        }
        setReviewModalOpen(false);
        setSubmitting(false);
        toast.success(input.flagged ? "Review and flag posted!" : "Review posted!");
    }

    /**
     * Sends a completion request for the opportunity and refreshes the page data
     */
    async function requestCompletion() {
        if (submitting) return;
        setSubmitting(true);
        try {
            await VolunteerService.requestCompletion(oppId);
            const result = await VolunteerService.getOpportunityById(oppId);
            if (result.success) setOpp(result.data);
            setCompleteConfirmOpen(false);
        } catch {
            setError("Failed to request completion.");
        } finally {
            setSubmitting(false);
        }
    }

    /**
     * Logs the skills the volunteer used during this opportunity
     * @param skills - array of skill label strings selected by the volunteer
     */
    async function submitSkills(skills: string[]) {
        if (submitting) return;
        setSubmitting(true);
        try {
            await VolunteerService.logOppSkills(oppId, skills);
            setSkillsAlreadySubmitted(true);
            setSkillModalOpen(false);
            toast.success("Skills logged!", { description: "Your skills have been saved." });
        } catch (err) {
            setSkillModalOpen(false);
            const msg = err instanceof Error ? err.message : String(err);
            // Handle the duplicate submission case specifically
            if (msg.includes("409") || msg.includes("ALREADY_SUBMITTED")) {
                toast.error("Already submitted", {
                    description: "You've already logged skills for this opportunity.",
                });
            } else {
                toast.error("Failed to log skills. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    // Derived stats shown on the completed opportunity view
    const totalHours = opp?.progressUpdates?.reduce((sum, u) => sum + u.hoursContributed, 0) ?? 0;
    const economicValue = currentVolunteer
        ? Math.round(totalHours * currentVolunteer.hourlyValue)
        : 0;

    return {
        opp,
        currentVolunteer,
        pageLoading,
        error,
        router,
        totalHours,
        economicValue,
        progressModalOpen,
        setProgressModalOpen,
        reviewModalOpen,
        setReviewModalOpen,
        completeConfirmOpen,
        setCompleteConfirmOpen,
        skillModalOpen,
        setSkillModalOpen,
        skillsAlreadySubmitted,
        submitting,
        submitProgressUpdate,
        submitReview,
        requestCompletion,
        submitSkills,
    };
}
