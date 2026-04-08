"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FolderKanban,
    PersonStanding,
    Hourglass,
    UserRoundPen,
    LogOut,
    MessageCircleQuestionMark,
    Users,
    Calendar,
    CalendarCheck,
    Briefcase,
} from "lucide-react";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { useOrgDashboardViewModel } from "./orgDashboardVm";
import { ModStatCard } from "@/components/custom/mod_stat_card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avtImg from "@/assets/avatarImg.png";
import volunteerly_logo from "@/assets/volunteerly_logo.png";
import { OrgStatCard } from "@/components/custom/org_stat_card";
import { UserService } from "@/services/UserService";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/common/loading-screen";
import { getAvatarFallback } from "@/components/navigation/nav-utils";
import { SubmitTicketModal } from "@/components/common/tickets/submit-ticket-modal";

export default function HomePage() {
    const {
        loading,
        session,
        fetching,
        signOut,
        router,
        user,
        error,
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
            <main className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] p-6 ">
                <div className="w-full mb-5 md:mb-0 md:w-2/3 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                    <div className="md:flex items-center justify-between">
                        <div>
                            <h1 className="text-2x1 font-bold">Welcome, {currentUser?.orgName}</h1>
                            <p>Here&apos;s what&apos;s happening with your projects today.</p>
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

                    <div className="md:flex md:justify-around md:grid md:gap-3 md:grid-cols-3">
                        <OrgStatCard icon={PersonStanding} label="Active Volunteers" count={activeVlt} money={false} />
                        <OrgStatCard icon={FolderKanban} label="All-Time Projects" count={totalOpps} money={false} />
                        <OrgStatCard icon={Hourglass} label="All-Time Hours" count={totalHours} money={false} />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <Card className="h-full overflow-y-auto">
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
                                <CardContent className="flex flex-col justify-center h-full text-center justify-center">
                                    <div className="flex justify-center mb-4">
                                        <Avatar size="lg">
                                            <AvatarImage src={volunteerly_logo.src} />
                                            <AvatarFallback></AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h3 className="text-lg">No Opportunities</h3>
                                    <p>
                                        Posted Opportunities awaiting selection, or in-progress opportunities show up
                                        here.
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
                                                    <ItemDescription className="flex items-center gap-2 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Users /> {opp._count?.applications} Applicant(s)
                                                        </span>

                                                        <span className="flex items-center gap-1">
                                                            <Calendar /> Posted {opp.postedDate.toLocaleDateString()}
                                                        </span>

                                                        <span className="flex items-center gap-1">
                                                            <Hourglass /> Due {opp.deadlineDate?.toLocaleDateString()}
                                                        </span>
                                                    </ItemDescription>
                                                ) : (
                                                    <ItemDescription className="flex items-center gap-2 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <PersonStanding /> {opp.volunteer?.firstName}{" "}
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
                                                        router.push(`/organization/opportunities/${opp.id}`);
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
                </div>
                <div className="w-full md:w-1/3 mx-auto max-w-3xl space-y-6 min-h-full flex flex-col justify-center">
                    <Card className="mx-5">
                        <CardContent className="text-center">
                            <div className="flex justify-center mb-4">
                                <Avatar className="h-auto w-20">
                                    <AvatarImage src={UserService.getAvatarURL(currentUser?.id || "")} />
                                    <AvatarFallback> {getAvatarFallback(currentUser?.orgName)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <h3>{currentUser?.orgName}</h3>
                            <p>{currentUser?.causeCategory}</p>
                        </CardContent>
                        <hr className="mx-10 border-gray-300" />
                        <CardContent>
                            <Button
                                variant="ghost"
                                className="text-lg py-6 cursor-pointer flex gap-3 cursor-pointer"
                                onClick={async () => {
                                    router.push("/organization/profile");
                                }}
                            >
                                <UserRoundPen className="!w-5 !h-5 shrink-0" />
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
                                className="text-lg py-6 cursor-pointer flex gap-3 cursor-pointer"
                            >
                                <LogOut className="!w-5 !h-5 shrink-0" />
                                Log Out
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="mx-5">
                        <CardHeader>
                            <CardTitle>Need Help?</CardTitle>
                            <CardDescription>Open a ticket with our moderator team for assistance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="ghost"
                                className="w-full text-md py-6 cursor-pointer flex items-center gap-3 cursor-pointer"
                                onClick={() => setIsTicketModalOpen(true)}
                            >
                                <MessageCircleQuestionMark className="!w-7 !h-7 shrink-0" />
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <SubmitTicketModal
                open={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                onSubmitted={(ticket) => router.push(`/organization/messages?conversationId=${ticket.conversationId}`)}
            />
        </div>
    );
}
