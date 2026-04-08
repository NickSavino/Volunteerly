"use client";

import { ArrowLeft, Briefcase, GraduationCap, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { use } from "react";
import volunteerly_logo from "@/assets/volunteerly_logo.png";
import { useOppApplicationViewModel } from "./oppApplicationVm";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/common/loading-screen";
import { UserService } from "@/services/UserService";

export default function ViewApplicationPage({ params }: { params: Promise<{ id: string; appId: string }> }) {
    const { id, appId } = use(params);
    const {
        loading,
        fetching,
        session,
        signOut,
        router,
        user,
        error,
        matchedSchedule,
        currentUser,
        application,
        selectVolunteer,
    } = useOppApplicationViewModel(id, appId);

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Organization View Opportunity - Volunteerly</title>

            <main className="
                flex flex-col p-6
                md:mx-10 md:flex-row
            ">
                <div className="
                    mx-auto mb-5 mb-10 flex w-full max-w-3xl flex-col gap-6
                    md:mb-0 md:w-3/4
                ">
                    <div>
                        <Button variant="ghost" className="cursor-pointer" onClick={() => router.back()}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>

                        <h1>Review Application</h1>
                    </div>

                    <Card>
                        <CardContent>
                            <div className="
                                gap-6 text-center
                                md:grid md:grid-cols-8 md:text-left
                            ">
                                <div className="
                                    flex justify-center
                                    md:col-span-2 md:w-full
                                ">
                                    <Avatar className="h-auto w-20">
                                        <AvatarImage src={UserService.getAvatarURL(application?.volId || "")} />
                                        <AvatarFallback>
                                            {" "}
                                            <User className="h-auto w-20"></User>
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="
                                    flex flex-col gap-1
                                    md:col-span-4
                                ">
                                    <div className="
                                        gap-3
                                        md:flex
                                    ">
                                        <h3>
                                            {application?.volunteer?.firstName} {application?.volunteer?.lastName}
                                        </h3>
                                        <Badge
                                            className={
                                                (application?.matchPercentage || 0) >= 80
                                                    ? "bg-green-500"
                                                    : (application?.matchPercentage || 0) >= 50
                                                      ? "bg-yellow-500"
                                                      : "bg-red-500"
                                            }
                                        >
                                            {application?.matchPercentage}% Match
                                        </Badge>
                                    </div>
                                    {application?.volunteer?.workExperiences && (
                                        <h4>{application?.volunteer?.workExperiences[0].jobTitle}</h4>
                                    )}
                                    <p className="text-sm">Applied {application?.dateApplied?.toLocaleDateString()}</p>
                                    <p className="text-sm">{application?.volunteer?.bio}</p>
                                </div>

                                <div className="
                                    flex flex-col items-center gap-3 pt-3
                                    md:col-span-2 md:pt-0
                                ">
                                    <span className="
                                        flex flex-1 items-center justify-center gap-3
                                        md:justify-start
                                    ">
                                        <MapPin className="text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">
                                                {application?.volunteer?.location}
                                            </span>
                                        </div>
                                    </span>
                                    {(application?.volunteer?.averageRating || 0) > 0 && (
                                        <>
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const fill = Math.min(
                                                        1,
                                                        Math.max(
                                                            0,
                                                            (application?.volunteer?.averageRating ?? 0) - (star - 1),
                                                        ),
                                                    );
                                                    const pct = Math.round(fill * 100);
                                                    return (
                                                        <span key={star} className="
                                                            relative text-2xl leading-none
                                                        ">
                                                            <span className="text-gray-500">★</span>
                                                            <span
                                                                className="
                                                                    absolute inset-0 overflow-hidden
                                                                    text-primary
                                                                "
                                                                style={{ width: `${pct}%` }}
                                                            >
                                                                ★
                                                            </span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {(application?.volunteer?.averageRating || 0).toFixed(1)} / 5.0
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Volunteer Details</CardTitle>
                        </CardHeader>
                        {application?.volunteer?.workExperiences?.length === 0 &&
                            application?.volunteer?.educations?.length === 0 && (
                                <CardContent className="
                                    flex h-full flex-col justify-center text-center
                                ">
                                    <div className="mb-4 flex justify-center">
                                        <Avatar size="lg">
                                            <AvatarImage src={volunteerly_logo.src} />
                                            <AvatarFallback></AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h3 className="text-lg">No Experiences</h3>
                                </CardContent>
                            )}
                        {(application?.volunteer?.workExperiences?.length || 0) > 0 && (
                            <CardContent>
                                <CardTitle className="text-sm text-muted-foreground">Employment Experience</CardTitle>
                                {application?.volunteer?.workExperiences?.map((exp) => (
                                    <Item key={exp.id}>
                                        <ItemMedia>
                                            <Briefcase className="size-10 text-primary" />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>
                                                {exp.jobTitle} | {exp.company}
                                            </ItemTitle>
                                            <ItemDescription>{exp.responsibilities}</ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <ItemDescription>
                                                {exp.startDate?.getFullYear()} -{" "}
                                                {exp.endDate?.getFullYear() || "Present"}
                                            </ItemDescription>
                                        </ItemActions>
                                    </Item>
                                ))}
                            </CardContent>
                        )}
                        {(application?.volunteer?.educations?.length || 0) > 0 && (
                            <CardContent>
                                <CardTitle className="text-sm text-muted-foreground">Education</CardTitle>
                                {application?.volunteer?.educations?.map((edu) => (
                                    <Item key={edu.id}>
                                        <ItemMedia>
                                            <GraduationCap className="size-10 text-primary" />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>{edu.degree}</ItemTitle>
                                            <ItemDescription>{edu.institution}</ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <ItemDescription>{edu.graduationYear}</ItemDescription>
                                        </ItemActions>
                                    </Item>
                                ))}
                            </CardContent>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Opportunity Specific Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-md pb-2">Message to Organization</CardTitle>
                            <p>{application?.message}</p>
                        </CardContent>
                        <CardContent>
                            <CardTitle className="text-md pb-2">Availability Match</CardTitle>
                            {matchedSchedule?.length === 0 ? (
                                <p className="text-destructive">No Days Match</p>
                            ) : (
                                <p>{matchedSchedule?.join(", ")}</p>
                            )}
                        </CardContent>
                    </Card>

                    <Button className="cursor-pointer" onClick={selectVolunteer}>
                        Approve Application
                    </Button>
                </div>
            </main>
        </div>
    );
}
