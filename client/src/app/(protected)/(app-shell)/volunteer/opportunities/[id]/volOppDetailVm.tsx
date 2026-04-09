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

export function useVolOppDetailViewModel(oppId: string) {
    const router = useRouter();
    const { session, loading } = useAuth();

    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
    const [skillModalOpen, setSkillModalOpen] = useState(false);
    const [skillsAlreadySubmitted, setSkillsAlreadySubmitted] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;
            try {
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

    async function submitProgressUpdate(input: ProgressUpdateInput) {
        if (submitting) return;
        setSubmitting(true);
        try {
            await VolunteerService.addProgressUpdate(oppId, input);
            const result = await VolunteerService.getOpportunityById(oppId);
            if (result.success) setOpp(result.data);
            setProgressModalOpen(false);
        } catch {
            setError("Failed to submit progress update.");
        } finally {
            setSubmitting(false);
        }
    }

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
                const body = JSON.parse(err instanceof Error ? err.message : "");
                if (body?.error?.toLowerCase().includes("already")) {
                    msg = "You have already reviewed this organization for this opportunity.";
                }
            } catch {}
            toast.error(msg);
            return;
        }
        if (input.flagged && input.flagReason?.trim()) {
            try {
                await VolunteerService.postFlag(opp.organization.id, input.flagReason.trim());
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
