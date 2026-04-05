"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";
import { api } from "@/lib/api";
import { CurrentUserSchema } from "@volunteerly/shared";

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

export function useExperienceInputViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();

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


    //redirect away if already verified
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
    async function loadName() {
        if (!session) return;
        const result = await VolunteerService.getCurrentVolunteer();
        if (result.success) {
            setFullName(`${result.data.firstName} ${result.data.lastName}`.trim());
        }
    }
    loadName();
    }, [session]);


    useEffect(() => {
    if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

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
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    }

    function addEducation() {
        setEducations((prev) => [
            ...prev,
            { institution: "", degree: "", graduationYear: "" },
        ]);
    }

    const removeEducation = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
    };

    function updateEducation(index: number, field: keyof Education, value: string) {
        setEducations((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    }

    function validate(): boolean {
        const newErrors: FormErrors = {};

        if (!resumeFile) {
            newErrors.resume = "Please upload a valid PDF.";
        }

        const hasIncompleteWork = workExperiences.some(
            (w) => !w.jobTitle || !w.company || !w.startDate || !w.responsibilities
        );
        if (hasIncompleteWork) {
            newErrors.workExperience = "Please fill in all fields.";
        }

        const hasIncompleteEdu = educations.some(
            (e) => !e.institution || !e.degree || !e.graduationYear
        );
        if (hasIncompleteEdu) {
            newErrors.education = "Please fill in all fields.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;
        setSubmitting(true);

        try {
            const workText = workExperiences
                .map(
                    (w) =>
                        `${w.jobTitle} at ${w.company} (${w.startDate}${w.endDate ? ` - ${w.endDate}` : " - Present"}): ${w.responsibilities}`
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
        removeEducation
    };
}