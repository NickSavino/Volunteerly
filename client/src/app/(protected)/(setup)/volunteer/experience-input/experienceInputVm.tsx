/**
 * experienceInputVm.tsx
 * View model for the volunteer onboarding experience input page. Manages resume, work history, and education form state
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";

export type WorkExperience = {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
};

export type Education = {
    institution: string;
    degree: string;
    graduationYear: string;
};

export type FormErrors = {
    resume?: string;
    workExperience?: string;
    education?: string;
};

/**
 * Drives all state and logic for the volunteer experience input page
 * @returns all form state, handlers, and submission logic needed by the page component
 */
export function useExperienceInputViewModel() {
    const router = useRouter();
    const { session, signOut } = useAuth();

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
        { jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" },
    ]);
    const [educations, setEducations] = useState<Education[]>([
        { institution: "", degree: "", graduationYear: "" },
    ]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [fullName, setFullName] = useState("Volunteer");

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

    function addWorkExperience() {
        setWorkExperiences((prev) => [
            ...prev,
            { jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" },
        ]);
    }

    const removeWorkExperience = (index: number) => {
        setWorkExperiences((prev) => prev.filter((_, i) => i !== index));
    };

    function updateWorkExperience(index: number, field: keyof WorkExperience, value: string) {
        setWorkExperiences((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        );
    }

    function addEducation() {
        setEducations((prev) => [...prev, { institution: "", degree: "", graduationYear: "" }]);
    }

    const removeEducation = (index: number) => {
        setEducations((prev) => prev.filter((_, i) => i !== index));
    };

    function updateEducation(index: number, field: keyof Education, value: string) {
        setEducations((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        );
    }

    /**
     * Validates all form sections, resume required, no incomplete work/education entries
     * @returns true if the form is valid, false otherwise
     */
    function validate(): boolean {
        const newErrors: FormErrors = {};

        if (!resumeFile) {
            newErrors.resume = "Please upload a valid PDF.";
        }

        const hasIncompleteWork = workExperiences.some(
            (w) => !w.jobTitle || !w.company || !w.startDate || !w.responsibilities,
        );
        if (hasIncompleteWork) {
            newErrors.workExperience = "Please fill in all fields.";
        }

        const hasIncompleteEdu = educations.some(
            (e) => !e.institution || !e.degree || !e.graduationYear,
        );
        if (hasIncompleteEdu) {
            newErrors.education = "Please fill in all fields.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    /**
     * Serializes form data into plain text, sends to Groq for skill extraction, then
     * stashes the results in sessionStorage before navigating to the skill review page
     */
    async function handleSubmit() {
        if (!validate()) return;
        setSubmitting(true);

        try {
            const workText = workExperiences
                .map(
                    (w) =>
                        `${w.jobTitle} at ${w.company} (${w.startDate}${w.endDate ? ` - ${w.endDate}` : " - Present"}): ${w.responsibilities}`,
                )
                .join("\n");

            const eduText = educations
                .map((e) => `${e.degree} from ${e.institution}, graduated ${e.graduationYear}`)
                .join("\n");

            const result = await VolunteerService.extractSkills(resumeFile!, workText, eduText);

            if (!result.success) {
                setErrors({ resume: "Failed to extract skills. Please try again." });
                return;
            }

            sessionStorage.setItem("extractedSkills", JSON.stringify(result.data));
            sessionStorage.setItem("workExperiences", JSON.stringify(workExperiences));
            sessionStorage.setItem("educations", JSON.stringify(educations));

            router.push("/volunteer/skill-extraction");
        } catch (err) {
            console.error(err);
            setErrors({ resume: "Something went wrong. Please try again." });
        } finally {
            setSubmitting(false);
        }
    }

    return {
        resumeFile,
        setResumeFile,
        workExperiences,
        educations,
        errors,
        submitting,
        addWorkExperience,
        updateWorkExperience,
        addEducation,
        updateEducation,
        handleSubmit,
        fullName,
        signOut,
        removeWorkExperience,
        removeEducation,
    };
}
