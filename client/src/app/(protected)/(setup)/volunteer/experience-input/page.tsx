"use client";

import { useExperienceInputViewModel } from "./experienceInputVm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UnverifiedNavbar } from "../../../(app-shell)/volunteer/unverified_volunteer_navbar";

export default function ExperienceInputPage() {
    const {
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
        signOut,
        fullName
    } = useExperienceInputViewModel();


    return (
        <div className="min-h-screen">
            <title>Volunteer - Experience Input</title>
        
        <UnverifiedNavbar
            fullName={fullName}
            onSignOut={signOut}
        />

            <main className="flex flex-col items-center px-8 py-10 gap-6 max-w-3xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Experience Input</h1>
                    <p className="text-muted-foreground mt-2">
                        To help us match you with the most suitable organizations, all volunteers are asked to provide their resume, work experience, and education.                    </p>
                </div>

                {/* Resume Upload */}
                <Card className={`w-full ${errors.resume ? "border-destructive" : ""}`}>
                    <CardHeader>
                        <CardTitle className="text-base">Resume Upload – Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 gap-3 ${
                                errors.resume ? "border-destructive bg-destructive/5" : "border-muted-foreground/30"
                            }`}
                        >
                            <p className="font-medium">Upload your Resume</p>
                            <p className="text-sm text-muted-foreground">PDF up to 10MB.</p>
                            {resumeFile && (
                                <p className="text-sm text-green-600 font-medium">{resumeFile.name}</p>
                            )}
                            <Label
                                htmlFor="resume-upload"
                                className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Browse Files
                            </Label>
                            <Input
                                id="resume-upload"
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                        {errors.resume && (
                            <p className="text-destructive text-sm mt-2">{errors.resume}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Work Experience */}
                <Card className={`w-full ${errors.workExperience ? "border-destructive" : ""}`}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Work Experience</CardTitle>
                            {errors.workExperience && (
                                <p className="text-destructive text-sm mt-1">{errors.workExperience}</p>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={addWorkExperience}>
                            + Add New
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {workExperiences.map((work, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                {i > 0 && <hr className="border-muted" />}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <Label>Job Title</Label>
                                        <Input
                                            placeholder="e.g. Project Manager"
                                            value={work.jobTitle}
                                            onChange={(e) => updateWorkExperience(i, "jobTitle", e.target.value)}
                                            className={errors.workExperience && !work.jobTitle ? "border-destructive" : ""}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Company</Label>
                                        <Input
                                            placeholder="Company Name"
                                            value={work.company}
                                            onChange={(e) => updateWorkExperience(i, "company", e.target.value)}
                                            className={errors.workExperience && !work.company ? "border-destructive" : ""}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={work.startDate}
                                            onChange={(e) => updateWorkExperience(i, "startDate", e.target.value)}
                                            className={errors.workExperience && !work.startDate ? "border-destructive" : ""}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={work.endDate}
                                            onChange={(e) => updateWorkExperience(i, "endDate", e.target.value)}
                                            className={errors.workExperience && !work.endDate ? "border-destructive" : ""}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Responsibilities</Label>
                                    <Textarea
                                        placeholder="Describe your key achievements..."
                                        value={work.responsibilities}
                                        onChange={(e) => updateWorkExperience(i, "responsibilities", e.target.value)}
                                        className={errors.workExperience && !work.responsibilities ? "border-destructive" : ""}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Education */}
                <Card className={`w-full ${errors.education ? "border-destructive" : ""}`}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Education</CardTitle>
                            {errors.education && (
                                <p className="text-destructive text-sm mt-1">{errors.education}</p>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={addEducation}>
                            + Add New
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {educations.map((edu, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                {i > 0 && <hr className="border-muted" />}
                                <div className="flex flex-col gap-1">
                                    <Label>Institution Name</Label>
                                    <Input
                                        placeholder="e.g. State University"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(i, "institution", e.target.value)}
                                        className={errors.education && !edu.institution ? "border-destructive" : ""}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Degree / Field of Study</Label>
                                    <Input
                                        placeholder="e.g. Bachelor of Science"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                                        className={errors.education && !edu.degree ? "border-destructive" : ""}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Graduation Year</Label>
                                    <Input
                                        placeholder="YYYY"
                                        value={edu.graduationYear}
                                        onChange={(e) => updateEducation(i, "graduationYear", e.target.value)}
                                        className={errors.education && !edu.graduationYear ? "border-destructive" : ""}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Extracting skills..." : "Submit Application"}
                </Button>
            </main>
        </div>
    );
}