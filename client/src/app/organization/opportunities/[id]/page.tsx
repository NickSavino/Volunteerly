"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, PersonStanding, Hourglass, Users, CalendarCheck, Briefcase, CalendarX, AlarmClockCheck, Handshake} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationNavbar } from "../../organization_navbar";
import { ModStatCard } from "@/components/custom/mod_stat_card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
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
    const {loading, session, signOut, router, user, error, currentUser, opportunity} = useOrgViewOpportunityViewModel(id)

    if (loading || !session ) {
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
            <div className="w-full md:w-3/4 mb-5 md:mb-0 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{opportunity?.status}</Badge>
                    <p>Posted on {opportunity?.postedDate}</p>
                </div>
                <h2 className="text-2x1 font-bold">{opportunity?.name} - {opportunity?.workType}</h2>
                <h3>{opportunity?.category}</h3>
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
                                <span className="text-sm">{opportunity?.deadlineDate}</span>
                            </div>
                        </span>
                    </CardContent>
                    <CardContent className="md:flex justify-around">
                        <span className="flex flex-1 items-center gap-3">
                            <AlarmClockCheck className="w-9 h-9"/> 
                            <div className="flex flex-col">
                                <span className="text-xs">Availablity</span>
                                <span>{opportunity?.availability}</span>
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


            </div>
        </main>
    </div>
    );
}