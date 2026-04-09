"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, PersonStanding, Hourglass, Users, CalendarCheck, Briefcase } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { ModStatCard } from "@/components/custom/mod_stat_card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avtImg from "@/assets/avatarImg.png";
import volunteerly_logo from "@/assets/volunteerly_logo.png";
import { useOrgOpportunitiesViewModel } from "./orgOpportunitiesVm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/common/loading-screen";

export default function OrgOpportunitiesPage() {
    const {
        loading,
        session,
        fetching,
        signOut,
        router,
        user,
        error,
        currentUser,
        filteredOpportunities,
        currentTab,
        setCurrentTab,
    } = useOrgOpportunitiesViewModel();

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Organization Opportunities - Volunteerly</title>
            <main className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] md:p-6 py-6">
                <div className="w-full mb-5 md:mb-0 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                    <div className="md:flex items-center justify-between mx-3 md:mx-0">
                        <div>
                            <h1 className="text-2x1 font-bold">Opportunities</h1>
                            <p>Manage and track your organization&apos;s volunteer projects.</p>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full text-accent-foreground cursor-pointer"
                                onClick={async () => {
                                    router.push("/organization/opportunities/create");
                                }}
                            >
                                Create New Opportunity
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <Card className="h-full overflow-y-auto">
                            <CardContent className="h-full flex flex-col">
                                <Tabs
                                    defaultValue="OPEN"
                                    value={currentTab}
                                    onValueChange={setCurrentTab}
                                    className="flex flex-col h-full"
                                >
                                    <div className="w-full border-b border-gray-300 mb-5">
                                        <TabsList className="flex md:w-1/2" variant="line">
                                            <TabsTrigger value="OPEN" className="cursor-pointer">
                                                Posted
                                            </TabsTrigger>
                                            <TabsTrigger value="FILLED" className="cursor-pointer">
                                                In-Progress
                                            </TabsTrigger>
                                            <TabsTrigger value="CLOSED" className="cursor-pointer">
                                                Completed
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <TabsContent value={"OPEN"}>
                                        {filteredOpportunities.length === 0 ? (
                                            <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                                                <div className="flex justify-center mb-4">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">No Posted Opportunities</h3>
                                                <p>Posted Opportunities awaiting selection show up here.</p>
                                            </CardContent>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <Item key={opp.id} variant="outline" className="mb-2">
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {opp.name} <Badge>{opp.status}</Badge>{" "}
                                                        </ItemTitle>
                                                        <ItemDescription className="flex items-center gap-2 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Users /> {opp._count?.applications} Applicant(s)
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Calendar /> Posted{" "}
                                                                {opp.postedDate?.toLocaleDateString()}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Hourglass /> Due{" "}
                                                                {opp.deadlineDate?.toLocaleDateString()}
                                                            </span>
                                                        </ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                            size="sm"
                                                            onClick={async () => {
                                                                router.push(`/organization/opportunities/${opp.id}`);
                                                            }}
                                                        >
                                                            View Applications
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))
                                        )}
                                    </TabsContent>

                                    <TabsContent value={"FILLED"}>
                                        {filteredOpportunities.length === 0 ? (
                                            <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                                                <div className="flex justify-center mb-4">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">No In-Progress Opportunities</h3>
                                                <p> In-progress opportunities show up here.</p>
                                            </CardContent>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <Item key={opp.id} variant="outline" className="mb-2">
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {opp.name} <Badge>{opp.status}</Badge>{" "}
                                                        </ItemTitle>
                                                        <ItemDescription className="flex items-center gap-2 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <PersonStanding /> {opp.volunteer?.firstName}{" "}
                                                                {opp.volunteer?.lastName}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <CalendarCheck /> {opp.length}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Briefcase /> {opp.workType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                                                            </span>
                                                        </ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                            size="sm"
                                                            onClick={async () => {
                                                                router.push(`/organization/opportunities/${opp.id}`);
                                                            }}
                                                        >
                                                            View Progress
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))
                                        )}
                                    </TabsContent>

                                    <TabsContent value={"CLOSED"}>
                                        {filteredOpportunities.length === 0 ? (
                                            <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                                                <div className="flex justify-center mb-4">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">No Completed Opportunities</h3>
                                                <p>Completed Opportunities show up here.</p>
                                            </CardContent>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <Item key={opp.id} variant="outline" className="mb-2">
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {opp.name} <Badge>{opp.status}</Badge>{" "}
                                                        </ItemTitle>
                                                        <ItemDescription className="flex items-center gap-2 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <PersonStanding /> {opp.volunteer?.firstName}{" "}
                                                                {opp.volunteer?.lastName}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <CalendarCheck /> {opp.length}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Briefcase /> {opp.workType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                                                            </span>
                                                        </ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                            size="sm"
                                                            onClick={async () => {
                                                                router.push(`/organization/opportunities/${opp.id}`);
                                                            }}
                                                        >
                                                            View History
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
