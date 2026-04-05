"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { CurrentUserSchema, ExtractedSkills } from "@volunteerly/shared";
import { VolunteerService } from "@/services/VolunteerService";
import { Education, WorkExperience } from "../../../(setup)/volunteer/experience-input/experienceInputVm";

export function useSkillExtractionViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [skills, setSkills] = useState<ExtractedSkills | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullName, setFullName] = useState("Volunteer");

    //Redirect away if already verified
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

    //Load skills from session storage
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
    }, []);

    useEffect(() => {
        async function loadName() {
            if (!session) return;
            const result = await VolunteerService.getCurrentVolunteer();
            if (result.success) {
                setFullName(`${result.data.firstName} ${result.data.lastName}`.trim());
            }
        }
        loadName();
    }, [session]);

    
    function removeSkill(category: "technical" | "nonTechnical", skill: string) {
        setSkills((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [category]: prev[category].filter((s) => s !== skill),
            };
        });
    }

    function handleBack() {
    router.replace("/volunteer/experience-input");
    }

    async function handleConfirm() {
        if (!skills) return;
        setConfirming(true);
        setError(null);
        try {
            const workExperiences: WorkExperience[] = JSON.parse(
                sessionStorage.getItem("workExperiences") ?? "[]"
            );
            const educations: Education[] = JSON.parse(
                sessionStorage.getItem("educations") ?? "[]"
            );

            await VolunteerService.confirmSkills(skills, workExperiences, educations);

            sessionStorage.removeItem("extractedSkills");
            sessionStorage.removeItem("workExperiences");
            sessionStorage.removeItem("educations");

            router.replace("/volunteer");
        } catch (err) {
            console.error(err);
            setError("Something went wrong saving your skills. Please try again.");
        } finally {
            setConfirming(false);
        }
    }

    return {
        skills,
        confirming,
        error,
        removeSkill,
        handleConfirm,
        signOut,
        fullName,
        handleBack
    };
}