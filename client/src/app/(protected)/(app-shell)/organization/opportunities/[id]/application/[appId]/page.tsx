"use client";

import { ArrowLeft, Briefcase, GraduationCap, MapPin, School} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import avtImg from "@/assets/avatarImg.png"
import { use } from 'react'
import volunteerly_logo from "@/assets/volunteerly_logo.png"
import { useOppApplicationViewModel } from "./oppApplicationVm";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/common/loading-screen";


export default function ViewApplicationPage({
  params,
}: {
  params: Promise<{ id: string, appId: string }>
}) {
    const { id, appId } = use(params);
    const {loading, fetching, session, signOut, router, user, error, currentUser, application, selectVolunteer} = useOppApplicationViewModel(id, appId)

    if (loading || !session || fetching) {
        return <LoadingScreen />
    }

  return (
    <div className="min-h-screen">
        <title>Organization View Opportunity - Volunteerly</title>       

        <main className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] p-6 mx-10">

            <div className="w-full md:w-3/4 mb-5 md:mb-0 mx-auto max-w-3x1 flex flex-col min-h-full gap-6 mb-10">
                <div>
                    <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>

                    <h1>Review Application</h1>
                </div>

                <Card>
                    <CardContent>
                        <div className="text-center md:text-left md:grid md:grid-cols-8 gap-6">
                            <div className="flex md:w-full justify-center md:col-span-2">
                                <img src={avtImg.src} className="w-24 md:w-30 rounded-lg object-cover"/>
                            </div>

                            <div className="md:col-span-4 flex flex-col gap-3">
                                <h3>{application?.volunteer?.firstName} {application?.volunteer?.lastName}</h3>
                                <p>Applied {application?.dateApplied?.toLocaleDateString()}</p>
                                <p className="text-sm">{application?.volunteer?.bio}</p>
                            </div>

                            <div className="md:col-span-2 flex flex-col items-center gap-3">
                                <Badge   className={
                                    (application?.matchPercentage || 0) >= 80
                                    ? "bg-green-500"
                                    : (application?.matchPercentage || 0) >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }>
                                {application?.matchPercentage}% Match</Badge>                                
                                <span className="flex flex-1 items-center gap-3 justify-center md:justify-start">
                                    <MapPin/> 
                                    <div className="flex flex-col">
                                        <span className="text-sm">{application?.volunteer?.location}</span>
                                    </div>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Volunteer Details</CardTitle>
                    </CardHeader>
                    {(application?.volunteer?.workExperiences?.length === 0) && (application?.volunteer?.educations?.length === 0) &&
                        <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                            <div className="flex justify-center mb-4">
                                <Avatar size="lg">
                                    <AvatarImage src={volunteerly_logo.src} />
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                            </div>
                            <h3 className="text-lg">No Experiences</h3>
                        </CardContent>
                    }
                    {(application?.volunteer?.workExperiences?.length || 0) > 0 &&
                        <CardContent>
                            <CardTitle className="text-muted-foreground text-sm">Employment Experience</CardTitle>
                            {application?.volunteer?.workExperiences?.map((exp) => (
                                <Item key={exp.id}>
                                    <ItemMedia>
                                        <Briefcase className="size-10 text-primary" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{exp.jobTitle} | {exp.company}</ItemTitle>
                                        <ItemDescription>{exp.responsibilities}</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <ItemDescription>{exp.startDate?.getFullYear()} - {exp.endDate?.getFullYear() || "Present"}</ItemDescription>
                                    </ItemActions>
                                </Item>
                            ))
                            
                            }
                        </CardContent>
                    }
                    {(application?.volunteer?.workExperiences?.length || 0) > 0 &&
                        <CardContent>
                            <CardTitle className="text-muted-foreground text-sm">Education</CardTitle>
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
                            ))
                            
                            }
                        </CardContent>
                    }
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Message to Organization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{application?.message}</p>
                    </CardContent>
                </Card>

                <Button className="cursor-pointer" onClick={selectVolunteer}>Approve Application</Button>

            </div>
        </main>
    </div>
    );
}