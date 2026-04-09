"use client";

import { UnverifiedNavbar } from "@/app/(protected)/(setup)/volunteer/unverified_volunteer_navbar";
import { useSkillExtractionViewModel } from "./skillExtractionVm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillExtractionPage() {
    const { skills, confirming, error, removeSkill, handleConfirm, signOut, fullName, handleBack } =
        useSkillExtractionViewModel();

    if (!skills) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen">
            <title>Volunteer - Skill Extraction</title>

            <UnverifiedNavbar fullName={fullName} onSignOut={signOut} />

            <main className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-8 py-10">
                <Card className="w-full">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold">Extraction Complete</h1>
                        <p className="mt-1 text-muted-foreground">
                            We&apos;ve finished extracting your skills from your profile.
                            <br />
                            Please verify your skills before proceeding. Click the × to remove any
                            incorrect skills.
                        </p>
                        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                    </CardContent>
                </Card>

                <div className="w-full">
                    <h2 className="mb-4 text-lg font-semibold">Extracted Skills</h2>
                    <div
                        className="
                            grid grid-cols-1 gap-4
                            md:grid-cols-2
                        "
                    >
                        <SkillCard
                            title="Technical Skills"
                            icon=""
                            skills={skills.technical}
                            onRemove={(skill) => removeSkill("technical", skill)}
                        />
                        <SkillCard
                            title="Non-Technical Skills"
                            icon=""
                            skills={skills.nonTechnical}
                            onRemove={(skill) => removeSkill("nonTechnical", skill)}
                        />
                    </div>
                </div>

                <div className="w-full flex items-center justify-between">
                    <Button className="cursor-pointer" variant="ghost" onClick={handleBack}>
                        Back to Experience Input
                    </Button>
                    <Button className="cursor-pointer" onClick={handleConfirm} disabled={confirming}>
                        {confirming ? "Saving..." : "Confirm & Continue"}
                    </Button>
                </div>
            </main>
        </div>
    );
}

function SkillCard({
    title,
    icon,
    skills,
    onRemove,
}: {
    title: string;
    icon: string;
    skills: string[];
    onRemove: (skill: string) => void;
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <span>{icon}</span> {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No skills extracted.</p>
                ) : (
                    skills.map((skill, index) => (
                        <span
                            key={`${skill}-${index}`}
                            className="
                                flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm
                                text-secondary-foreground
                            "
                        >
                            {skill}
                            <button
                                onClick={() => onRemove(skill)}
                                className="cursor-pointer ml-1 text-muted-foreground hover:text-destructive transition-colors text-xs font-bold"
                                aria-label={`Remove ${skill}`}
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}
                <p className="mt-2 w-full text-xs text-muted-foreground">
                    {skills.length} skill{skills.length !== 1 ? "s" : ""} extracted
                </p>
            </CardContent>
        </Card>
    );
}
