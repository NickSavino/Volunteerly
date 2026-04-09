"use client";

import volunteerly_logo from "@/assets/volunteerly_logo.png";
import { LoadingScreen } from "@/components/common/loading-screen";
import { SubmitTicketModal } from "@/components/common/tickets/submit-ticket-modal";
import { OrgStatCard } from "@/components/custom/org_stat_card";
import { getAvatarFallback } from "@/components/navigation/nav-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { UserService } from "@/services/UserService";
import {
    Briefcase,
    Calendar,
    CalendarCheck,
    FolderKanban,
    Hourglass,
    LogOut,
    MessageCircleQuestionMark,
    PersonStanding,
    UserRoundPen,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useOrgDashboardViewModel } from "./orgDashboardVm";

export default function HomePage() {
    const {
        loading,
        session,
        fetching,
        signOut,
        router,
        currentUser,
        opportunities,
        totalOpps,
        totalHours,
        activeVlt,
    } = useOrgDashboardViewModel();

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Organization Dashboard - Volunteerly</title>
            <main className="p-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    <div
                        className="
                            flex flex-col gap-4
                            md:flex-row md:items-center md:justify-between
                        "
                    >
                        <div>
                            <h1 className="text-2xl font-bold">Welcome, {currentUser?.orgName}</h1>
                            <p>Here&apos;s what&apos;s happening with your projects today.</p>
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

                    <div
                        className="
                            flex flex-col gap-6
                            md:flex-row md:items-start
                        "
                    >
                        <div
                            className="
                                flex w-full flex-col gap-6
                                md:w-2/3
                            "
                        >
                            <div
                                className="
                                    grid gap-3
                                    md:grid-cols-3
                                "
                            >
                                <OrgStatCard
                                    icon={PersonStanding}
                                    label="Active Volunteers"
                                    count={activeVlt}
                                    money={false}
                                />
                                <OrgStatCard
                                    icon={FolderKanban}
                                    label="All-Time Projects"
                                    count={totalOpps}
                                    money={false}
                                />
                                <OrgStatCard
                                    icon={Hourglass}
                                    label="All-Time Hours"
                                    count={totalHours}
                                    money={false}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Active Opportunities</CardTitle>
                                    <CardAction>
                                        <Button
                                            variant="link"
                                            className="cursor-pointer"
                                            onClick={async () => {
                                                router.push("/organization/opportunities");
                                            }}
                                        >
                                            View All
                                        </Button>
                                    </CardAction>
                                </CardHeader>

                                {opportunities.length === 0 ? (
                                    <CardContent className="flex flex-col justify-center text-center">
                                        <div className="mb-4 flex justify-center">
                                            <Avatar size="lg">
                                                <AvatarImage src={volunteerly_logo.src} />
                                                <AvatarFallback></AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="text-lg">No Opportunities</h3>
                                        <p>
                                            Posted Opportunities awaiting selection, or in-progress
                                            opportunities show up here.
                                        </p>
                                    </CardContent>
                                ) : (
                                    opportunities.map((opp) => (
                                        <CardContent key={opp.id}>
                                            <Item variant="outline">
                                                <ItemContent>
                                                    <ItemTitle>
                                                        {opp.name} <Badge>{opp.status}</Badge>{" "}
                                                    </ItemTitle>
                                                    {opp.status == "OPEN" ? (
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
                                                                {opp.postedDate.toLocaleDateString()}
                                                            </span>

                                                            <span className="flex items-center gap-1">
                                                                <Hourglass /> Due{" "}
                                                                {opp.deadlineDate?.toLocaleDateString()}
                                                            </span>
                                                        </ItemDescription>
                                                    ) : (
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
                                                                <Briefcase /> {opp.workType}
                                                            </span>
                                                        </ItemDescription>
                                                    )}
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
                                                        View
                                                    </Button>
                                                </ItemActions>
                                            </Item>
                                        </CardContent>
                                    ))
                                )}
                            </Card>
                        </div>

                        <div
                            className="
                                flex w-full flex-col gap-6
                                md:w-1/3
                            "
                        >
                            <Card>
                                <CardContent className="text-center">
                                    <div className="mb-4 flex justify-center">
                                        <Avatar className="h-auto w-20">
                                            <AvatarImage
                                                src={UserService.getAvatarURL(currentUser?.id || "")}
                                            />
                                            <AvatarFallback>
                                                {" "}
                                                {getAvatarFallback(currentUser?.orgName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h3>{currentUser?.orgName}</h3>
                                    <p>{currentUser?.causeCategory}</p>
                                </CardContent>
                                <hr className="mx-10 border-gray-300" />
                                <CardContent>
                                    <Button
                                        variant="ghost"
                                        className="flex cursor-pointer gap-3 py-6 text-lg"
                                        onClick={async () => {
                                            router.push("/organization/profile");
                                        }}
                                    >
                                        <UserRoundPen className="size-5! shrink-0" />
                                        View Profile
                                    </Button>
                                </CardContent>
                                <CardContent>
                                    <Button
                                        variant="ghost"
                                        onClick={async () => {
                                            await signOut();
                                            router.push("/");
                                        }}
                                        className="flex cursor-pointer gap-3 py-6 text-lg"
                                    >
                                        <LogOut className="size-5! shrink-0" />
                                        Log Out
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Need Help?</CardTitle>
                                    <CardDescription>
                                        Open a ticket with our moderator team for assistance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="ghost"
                                        className="
                                            flex w-full cursor-pointer items-center gap-3 py-6
                                            text-base
                                        "
                                        onClick={() => setIsTicketModalOpen(true)}
                                    >
                                        <MessageCircleQuestionMark className="size-7! shrink-0" />
                                        Contact Support
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <SubmitTicketModal
                open={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                onSubmitted={(ticket) =>
                    router.push(`/organization/messages?conversationId=${ticket.conversationId}`)
                }
            />
        </div>
    );
}
