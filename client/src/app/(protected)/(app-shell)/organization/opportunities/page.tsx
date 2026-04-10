/**
 * page.tsx
 * Organization opportunities list page - tabbed view of OPEN, FILLED, and CLOSED opportunities
 */

"use client";

import volunteerly_logo from "@/assets/volunteerly_logo.png";
import { LoadingScreen } from "@/components/common/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, CalendarCheck, Hourglass, PersonStanding, Users } from "lucide-react";
import { useOrgOpportunitiesViewModel } from "./orgOpportunitiesVm";

export default function OrgOpportunitiesPage() {
    const { loading, session, fetching, router, filteredOpportunities, currentTab, setCurrentTab } =
        useOrgOpportunitiesViewModel();

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Organization Opportunities - Volunteerly</title>
            <main
                className="
                    flex flex-col py-6
                    md:h-[calc(100vh-64px)] md:flex-row md:p-6
                "
            >
                <div
                    className="
                        mx-auto mb-5 flex min-h-full w-full flex-col gap-6
                        md:mb-0
                    "
                >
                    {/* Page header with title and create button */}
                    <div
                        className="
                            mx-3 items-center justify-between
                            md:mx-0 md:flex
                        "
                    >
                        <div>
                            <h1 className="font-bold">Opportunities</h1>
                            <p>Manage and track your organization&apos;s volunteer projects.</p>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full cursor-pointer text-accent-foreground"
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
                            <CardContent className="flex h-full flex-col">
                                {/*
                                 * Three tabs - Posted (OPEN), In-Progress (FILLED), Completed (CLOSED)
                                 * The view model filters the full list based on currentTab
                                 */}
                                <Tabs
                                    defaultValue="OPEN"
                                    value={currentTab}
                                    onValueChange={setCurrentTab}
                                    className="flex h-full flex-col"
                                >
                                    <div className="mb-5 w-full border-b border-gray-300">
                                        <TabsList
                                            className="
                                                flex
                                                md:w-1/2
                                            "
                                            variant="line"
                                        >
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

                                    {/* OPEN tab - shows applicant count, post date, and deadline */}
                                    <TabsContent value={"OPEN"}>
                                        {filteredOpportunities.length === 0 ? (
                                            <CardContent
                                                className="
                                                    flex h-full flex-col justify-center text-center
                                                "
                                            >
                                                <div className="mb-4 flex justify-center">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">No Posted Opportunities</h3>
                                                <p>
                                                    Posted Opportunities awaiting selection show up
                                                    here.
                                                </p>
                                            </CardContent>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <Item
                                                    key={opp.id}
                                                    variant="outline"
                                                    className="mb-2"
                                                >
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {opp.name}{" "}
                                                            <Badge>{opp.status}</Badge>{" "}
                                                        </ItemTitle>
                                                        <ItemDescription
                                                            className="
                                                                flex flex-wrap items-center gap-2
                                                            "
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <Users /> {opp._count?.applications}{" "}
                                                                Applicant(s)
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
                                                                router.push(
                                                                    `/organization/opportunities/${opp.id}`,
                                                                );
                                                            }}
                                                        >
                                                            View Applications
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))
                                        )}
                                    </TabsContent>

                                    {/* FILLED tab - shows assigned volunteer, duration, and work type */}
                                    <TabsContent value={"FILLED"}>
                                        {filteredOpportunities.length === 0 ? (
                                            <CardContent
                                                className="
                                                    flex h-full flex-col justify-center text-center
                                                "
                                            >
                                                <div className="mb-4 flex justify-center">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">
                                                    No In-Progress Opportunities
                                                </h3>
                                                <p> In-progress opportunities show up here.</p>
                                            </CardContent>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <Item
                                                    key={opp.id}
                                                    variant="outline"
                                                    className="mb-2"
                                                >
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {opp.name}{" "}
                                                            <Badge>{opp.status}</Badge>{" "}
                                                        </ItemTitle>
                                                        <ItemDescription
                                                            className="
                                                                flex flex-wrap items-center gap-2
                                                            "
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <PersonStanding />{" "}
                                                                {opp.volunteer?.firstName}{" "}
                                                                {opp.volunteer?.lastName}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <CalendarCheck /> {opp.length}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Briefcase />{" "}
                                                                {/* Convert enum snake_case to readable Title Case */}
                                                                {opp.workType
                                                                    .replaceAll("_", " ")
                                                                    .toLowerCase()
                                                                    .replace(/\b\w/g, (char) =>
                                                                        char.toUpperCase(),
                                                                    )}
                                                            </span>
                                                        </ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                            size="sm"
                                                            onClick={async () => {
                                                                router.push(
                                                                    `/organization/opportunities/${opp.id}`,
                                                                );
                                                            }}
                                                        >
                                                            View Progress
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))
                                        )}
                                    </TabsContent>

                                    {/* CLOSED tab - shows completed opportunity history */}
                                    <TabsContent value={"CLOSED"}>
                                        {filteredOpportunities.length === 0 ? (
                                            <CardContent
                                                className="
                                                    flex h-full flex-col justify-center text-center
                                                "
                                            >
                                                <div className="mb-4 flex justify-center">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">
                                                    No Completed Opportunities
                                                </h3>
                                                <p>Completed Opportunities show up here.</p>
                                            </CardContent>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <Item
                                                    key={opp.id}
                                                    variant="outline"
                                                    className="mb-2"
                                                >
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {opp.name}{" "}
                                                            <Badge>{opp.status}</Badge>{" "}
                                                        </ItemTitle>
                                                        <ItemDescription
                                                            className="
                                                                flex flex-wrap items-center gap-2
                                                            "
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <PersonStanding />{" "}
                                                                {opp.volunteer?.firstName}{" "}
                                                                {opp.volunteer?.lastName}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <CalendarCheck /> {opp.length}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Briefcase />{" "}
                                                                {opp.workType
                                                                    .replaceAll("_", " ")
                                                                    .toLowerCase()
                                                                    .replace(/\b\w/g, (char) =>
                                                                        char.toUpperCase(),
                                                                    )}
                                                            </span>
                                                        </ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                            size="sm"
                                                            onClick={async () => {
                                                                router.push(
                                                                    `/organization/opportunities/${opp.id}`,
                                                                );
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