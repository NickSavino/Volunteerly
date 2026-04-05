"use client";

import { useSkillExtractionViewModel } from "./skillExtractionVm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractedSkills } from "@volunteerly/shared";
import { UnverifiedNavbar } from "../../../(app-shell)/volunteer/unverified_volunteer_navbar";

export default function SkillExtractionPage() {
    const { skills, confirming, error, removeSkill, handleConfirm, signOut, fullName, handleBack } =
        useSkillExtractionViewModel();


    if (!skills) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen">
            <title>Volunteer - Skill Extraction</title>

            <UnverifiedNavbar
                fullName={fullName}
                onSignOut={signOut}
            />


            <main className="flex flex-col items-center px-8 py-10 gap-8 max-w-4xl mx-auto">

                <Card className="w-full">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold">Extraction Complete</h1>
                        <p className="text-muted-foreground mt-1">
                            We&apos;ve finished extracting your skills from your profile.<br />
                            Please verify your skills before proceeding. Click the × to remove any incorrect skills.
                        </p>
                        {error && (
                            <p className="text-destructive text-sm mt-3">{error}</p>
                        )}
                    </CardContent>
                </Card>

                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4">Extracted Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    skills.map((skill, index) => (
                        <span
                            key={`${skill}-${index}`}
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