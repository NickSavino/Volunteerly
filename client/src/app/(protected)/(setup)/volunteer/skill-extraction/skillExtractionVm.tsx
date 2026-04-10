/**
 * skillExtractionVm.tsx
 * View model for the skill extraction review page. Lets the volunteer verify and confirm their extracted skills
 */
"use client";

import { useAppSession } from "@/providers/app-session-provider";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";
import { ExtractedSkills } from "@volunteerly/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Education, WorkExperience } from "../experience-input/experienceInputVm";

/**
 * Drives all state and logic for the skill extraction review page
 * @returns skills state, removal handler, confirm/back handlers, and display helpers
 */
export function useSkillExtractionViewModel() {
    const router = useRouter();
    const { refresh } = useAppSession();
    const { session, signOut } = useAuth();
    const [skills, setSkills] = useState<ExtractedSkills | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullName, setFullName] = useState("Volunteer");

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
    }, [router]);

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

    /**
     * Removes a single skill from either the technical or non-technical list
     * @param category - which list to remove from ("technical" or "nonTechnical")
     * @param skill - the skill string to remove
     */
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

    /**
     * Submits the confirmed skills along with work experience and education to the server,
     * then refreshes the session and redirects to the volunteer dashboard
     */
    async function handleConfirm() {
        if (!skills) return;
        setConfirming(true);
        setError(null);
        try {
            const workExperiences: WorkExperience[] = JSON.parse(
                sessionStorage.getItem("workExperiences") ?? "[]",
            );
            const educations: Education[] = JSON.parse(
                sessionStorage.getItem("educations") ?? "[]",
            );

            await VolunteerService.confirmSkills(skills, workExperiences, educations);

            sessionStorage.removeItem("extractedSkills");
            sessionStorage.removeItem("workExperiences");
            sessionStorage.removeItem("educations");

            await refresh();
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
        handleBack,
    };
}
