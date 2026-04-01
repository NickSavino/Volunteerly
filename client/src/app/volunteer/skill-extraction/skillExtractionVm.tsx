"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { CurrentUserSchema, ExtractedSkills } from "@volunteerly/shared";
import { VolunteerService } from "@/services/VolunteerService";

export function useSkillExtractionViewModel() {
    const router = useRouter();
    const { session, loading } = useAuth();
    const [skills, setSkills] = useState<ExtractedSkills | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function checkVerified() {
            if (loading || !session) return;
            const json = await api<unknown>("/current-user");
            const parsed = CurrentUserSchema.safeParse(json);
            if (parsed.success && parsed.data.status === "VERIFIED") {
                router.replace("/volunteer");
            }
        }
        checkVerified();
    }, [session, loading, router]);

    useEffect(() => {
        const stored = sessionStorage.getItem("extractedSkills");
        if (!stored) {
            router.replace("/volunteer/experience-input");
            return;
        }
        try {
            setSkills(JSON.parse(stored) as ExtractedSkills);
        } catch {
            router.replace("/volunteer/experience-input");
        }
    }, [router]);

    function removeSkill(category: keyof ExtractedSkills, skill: string) {
        setSkills((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [category]: prev[category].filter((s) => s !== skill),
            };
        });
    }

    async function handleConfirm() {
        if (!skills) return;
        setConfirming(true);
        setError(null);
        try {
            await VolunteerService.confirmSkills(skills);
            sessionStorage.removeItem("extractedSkills");
            router.replace("/volunteer");
        } catch (err) {
            console.error(err);
            setError("Something went wrong saving your skills. Please try again.");
        } finally {
            setConfirming(false);
        }
    }

    function handleBack() {
        router.replace("/volunteer/experience-input");
    }

    return {
        skills,
        confirming,
        error,
        removeSkill,
        handleConfirm,
        handleBack,
    };
}