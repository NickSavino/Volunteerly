"use client";

import { useSkillExtractionViewModel } from "./skillExtractionVm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractedSkills } from "@volunteerly/shared";

export default function SkillExtractionPage() {
    const { skills, confirming, error, removeSkill, handleConfirm, handleBack } =
        useSkillExtractionViewModel();

    if (!skills) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen">
            <title>Volunteer - Skill Extraction</title>

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 border-b">
                <span className="font-semibold text-lg">Volunteerly</span>
            </nav>

            <main className="flex flex-col items-center px-8 py-10 gap-8 max-w-4xl mx-auto">

                {/* Header card */}
                <Card className="w-full">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold">Extraction Complete</h1>
                        <p className="text-muted-foreground mt-1">
                            We've finished extracting your skills from your profile,
                            please verify skills before proceeding.
                        </p>
                        {error && (
                            <p className="text-destructive text-sm mt-3">{error}</p>
                        )}
                    </CardContent>
                </Card>

                {/* The 3 Skill categories */}
                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4">Extracted Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SkillCard
                            title="Technical Skills"
                            icon=""
                            skills={skills.technical}
                            onRemove={(skill) => removeSkill("technical", skill)}
                        />
                        <SkillCard
                            title="Soft Skills"
                            icon=""
                            skills={skills.soft}
                            onRemove={(skill) => removeSkill("soft", skill)}
                        />
                        <SkillCard
                            title="Leadership Skills"
                            icon=""
                            skills={skills.leadership}
                            onRemove={(skill) => removeSkill("leadership", skill)}
                        />
                    </div>
                </div>

                {/* Footer actions */}
                <div className="w-full flex items-center justify-between">
                    <Button variant="ghost" onClick={handleBack}>
                        Back to Experience Input
                    </Button>
                    <Button onClick={handleConfirm} disabled={confirming}>
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
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>{icon}</span> {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No skills extracted.</p>
                ) : (
                    skills.map((skill) => (
                        <span
                            key={skill}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full"
                        >
                            {skill}
                            <button
                                onClick={() => onRemove(skill)}
                                className="ml-1 text-muted-foreground hover:text-destructive transition-colors text-xs font-bold"
                                aria-label={`Remove ${skill}`}
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}
                <p className="w-full text-xs text-muted-foreground mt-2">
                    {skills.length} skill{skills.length !== 1 ? "s" : ""} extracted
                </p>
            </CardContent>
        </Card>
    );
}