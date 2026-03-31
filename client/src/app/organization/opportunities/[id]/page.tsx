"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, PersonStanding, Hourglass, Users, CalendarCheck, Briefcase, CalendarX, AlarmClockCheck, Handshake, ArrowLeft, MessageSquareCheck, MessageCircleMore, UserStar, CircleDollarSign, Clock4} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationNavbar } from "../../organization_navbar";
import { OrgStatCard } from "@/components/custom/org_stat_card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avtImg from "@/assets/avatarImg.png"
import volunteerly_logo from "@/assets/volunteerly_logo.png"
import { useOrgOpportunitiesViewModel } from "../orgOpportunitiesVm";
import { use } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrgViewOpportunityViewModel } from "./orgViewOpportunityVm";


export default function ViewOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const {loading, fetching, session, signOut, router, user, error, currentUser, opportunity, applications, completeOpportunity, totalHours, monetaryValue} = useOrgViewOpportunityViewModel(id)

    if (loading || !session || fetching) {
        return <main className="p-6">Loading...</main>
    }

  return (
    <div className="min-h-screen">
        <title>Organization View Opportunity - Volunteerly</title>       
        <OrganizationNavbar
            currentOrg={currentUser}
            onSignOut={async () => {
                await signOut();
                router.push("/");
            }}
        />    

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
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge>{opportunity?.status}</Badge>
                        {opportunity?.status == "OPEN"? (
                            <p>Posted on {opportunity?.postedDate.toLocaleDateString()}</p>
                        ): 
                        (opportunity?.status == "FILLED"? 
                            (
                                <p>Started on {opportunity?.updatedAt.toLocaleDateString()}</p>
                            ):
                            (
                                <p>Completed on {opportunity?.updatedAt.toLocaleDateString()}</p>
                            )
                        )
                        }
                    </div>
                </div>
                
                <h2 className="text-2x1 font-bold">{opportunity?.name} - {opportunity?.workType} - {opportunity?.category}</h2>
                {opportunity?.status == "CLOSED" &&
                    <div className="md:flex md:justify-around md:grid md:gap-3 md:grid-cols-2">
                        <OrgStatCard
                            icon={Clock4}
                            label="Hours Spent"
                            count={totalHours}
                            money={false}
                        />
                        <OrgStatCard
                            icon={CircleDollarSign}
                            label="Monetary Valuation"
                            count={monetaryValue}
                            money={true}
                        />
                </div>
                }
                {
                    opportunity?.status == "OPEN" ?
                    (
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Description</CardTitle>
                                </CardHeader>
                                <CardContent>{opportunity?.description}</CardContent>
                                <CardHeader>
                                    <CardTitle>Ideal Candidate</CardTitle>
                                </CardHeader>
                                <CardContent>{opportunity?.candidateDesc}</CardContent>

                                <CardContent className="md:flex justify-around">
                                    <span className="flex flex-1 items-center gap-3">
                                        <Calendar className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Length</span>
                                            <span className="text-sm">{opportunity?.length}</span>
                                        </div>
                                    </span>
                                    <span className="flex flex-1 items-center gap-3">
                                        <CalendarX className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Deadline</span>
                                            <span className="text-sm">{opportunity?.deadlineDate?.toLocaleDateString()}</span>
                                        </div>
                                    </span>
                                </CardContent>
                                <CardContent className="md:flex justify-around">
                                    <span className="flex flex-1 items-center gap-3">
                                        <AlarmClockCheck className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Availability</span>
                                            <span>{opportunity?.availability.join(", ")}</span>
                                        </div>
                                    </span>

                                    <span className="flex flex-1 items-center gap-3">
                                        <Handshake className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Commitment</span>
                                            <span>{opportunity?.commitmentLevel}</span>
                                        </div>
                                    </span>
                                </CardContent>
                            </Card>
                            <Card className="mt-5 mb-5">
                                <CardHeader>
                                    <CardTitle>Applications</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    {applications.length === 0 ? (
                                        <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                                            <div className="flex justify-center mb-4">
                                                <Avatar size="lg">
                                                    <AvatarImage src={volunteerly_logo.src} />
                                                    <AvatarFallback></AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <h3 className="text-lg">No Applications</h3>
                                            <p>Volunteer Applications for this posting show up here.</p>
                                        </CardContent>                                                                        
                                            ) : (
                                                applications.map((app) => (
                                                    <Item key={app.id} variant="outline" className="mb-2">
                                                        <ItemMedia>
                                                            <Avatar size="lg">
                                                                <AvatarImage src={avtImg.src} />
                                                                <AvatarFallback>ORG</AvatarFallback>
                                                            </Avatar>
                                                        </ItemMedia>
                                                        <ItemContent>
                                                            <ItemTitle className="text-md">{app.volunteer?.firstName} {app.volunteer?.lastName}</ItemTitle>
                                                            <ItemDescription className="flex items-center gap-2 flex-wrap">
                                                                {app.message}
                                                            </ItemDescription>
                                                        </ItemContent>
                                                        <ItemActions>
                                                            <Badge   className={
                                                                app.matchPercentage >= 80
                                                                ? "bg-green-500"
                                                                : app.matchPercentage >= 50
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                            }
                                                            >{app.matchPercentage}% Match</Badge>
                                                            <Button variant="outline" className="cursor-pointer" size="sm" onClick={async () => { router.push(`/organization/opportunities/${opportunity.id}/application/${app.id}`);}}>
                                                                View Application
                                                            </Button>
                                                        </ItemActions>
                                                    </Item>
                                                ))
                                        )}     
                                </CardContent>
                            </Card>
                       
                        </div>
                    )
                    :
                    (
                        <div> 
                            <Card className="mb-5">
                                <CardHeader>
                                    <CardTitle>Opportunity Overview</CardTitle>
                                    <CardDescription>{opportunity?.description}</CardDescription>
                                    {opportunity?.status == "FILLED" &&
                                        <CardAction>
                                            <Button className="cursor-pointer" onClick={completeOpportunity}>Complete Opportunity</Button>
                                        </CardAction>
                                    }

                                </CardHeader>
                                <CardContent className="md:flex justify-around">
                                    <span className="flex flex-1 items-center gap-3">
                                        <Calendar className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Length</span>
                                            <span className="text-sm">{opportunity?.length}</span>
                                        </div>
                                    </span>
                                    <span className="flex flex-1 items-center gap-3">
                                        <AlarmClockCheck className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Availability</span>
                                            <span>{opportunity?.availability.join(", ")}</span>
                                        </div>
                                    </span>

                                    <span className="flex flex-1 items-center gap-3">
                                        <Handshake className="w-9 h-9"/> 
                                        <div className="flex flex-col">
                                            <span className="text-xs">Commitment</span>
                                            <span>{opportunity?.commitmentLevel}</span>
                                        </div>
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className="mb-5">
                                <CardContent>
                                    <div className="text-center md:text-left md:grid md:grid-cols-8 gap-6">
                                        <div className="flex md:w-full justify-center md:col-span-2">
                                            <img src={avtImg.src} className="w-22 rounded-lg object-cover"/>
                                        </div>

                                        <div className="md:col-span-4 flex flex-col gap-3">
                                            <p>Assigned Volunteer</p>
                                            <h3>{opportunity?.volunteer?.firstName} {opportunity?.volunteer?.lastName}</h3>
                                        </div>

                                        <div className="md:col-span-2 flex flex-col gap-3">
                                            <Button variant="outline" data-icon="inline-end" className="cursor-pointer"> <UserStar/> Review</Button>
                                            <Button variant="outline" data-icon="inline-end" className="cursor-pointer"> <MessageCircleMore/> Message</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mb-5">
                                <CardHeader>
                                    <CardTitle>Progress Tracking</CardTitle>
                                    {opportunity?.status == "FILLED" &&
                                        <CardAction>
                                            <Button variant={"outline"} className="cursor-pointer">Add Update</Button>
                                        </CardAction>
                                    }

                                </CardHeader>
                                    {opportunity?.progressUpdates?.length === 0 ? (
                                            <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                                                <div className="flex justify-center mb-4">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">No Updates</h3>
                                                <p>Progress Updates for this opportunity will show up here.</p>
                                            </CardContent>                                                                        
                                                ) : (                        
                                                    <CardContent className="space-y-4">
                                                        <div className="border-l-2 pl-4 space-y-4">
                                                            {opportunity?.progressUpdates?.map((update) => (
                                                                <div key={update.id}>
                                                                    <span className="absolute -left-3 top-1 w-3 h-3 rounded-full bg-primary" />
                                                                    <p className="text-xs">{update.createdAt.toLocaleDateString()}</p>
                                                                    <h5 className="text-lg">{update.title}</h5>
                                                                    <p className="text-sm text-muted-foreground">
                                                                    {update.description}
                                                                    </p>
                                                                    <p className="text-xs">{update.senderRole}</p>
                                                                </div>
                                                                ))}
                                                        </div>
                                                    </CardContent>                                                                        
                                                )     
                                            }                             
                            </Card>                            
                        </div>                        
                    )
                }
            </div>
        </main>
    </div>
    );
}