"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderKanban, PersonStanding, Hourglass, UserRoundPen, LogOut, MessageCircleQuestionMark} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../providers/auth-provider";
import { Button } from "../../components/ui/button";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { api } from "../../lib/api";
import { useOrgDashboardViewModel } from "./orgDashboardVm";
import { OrganizationNavbar } from "./organization_navbar";
import { ModStatCard } from "@/components/custom/mod_stat_card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avtImg from "@/assets/avatarImg.png"

export default function HomePage() {
  const {loading, session, signOut, router, user, error, currentUser} = useOrgDashboardViewModel()

  if (loading || !session ) {
    return <main className="p-6">Loading...</main>
  }

  return (
    <div className="min-h-screen">
        <title>Organization Dashboard - Volunteerly</title>
        <OrganizationNavbar
                    currentOrg={currentUser}
                    onSignOut={async () => {
                        await signOut();
                        router.push("/");
                    }}
                />    
        <main className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] p-6 ">
    
            <div className="w-full md:w-2/3 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                <div className="md:flex items-center justify-between">
                    <div>
                        <h1 className="text-2x1 font-bold">Welcome, {currentUser?.orgName}</h1>
                        <p>
                            Here's what's happening with your projects today.
                        </p>                    
                    </div>

                    <div>
                        <Button type="submit" className="w-full text-accent-foreground cursor-pointer">
                            Create New Opportunity
                        </Button>

                    </div>
                </div>

                <div className="md:flex items-center md:justify-around">
                    <ModStatCard
                        icon={FolderKanban}
                        label="Total Projects"
                        count={0}
                    />
                    <ModStatCard
                        icon={PersonStanding}
                        label="Active Volunteers"
                        count={0}
                    />
                    <ModStatCard
                        icon={Hourglass}
                        label="Hours Contribuited"
                        count={0}
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Card className="h-full overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Your Active Opportunities</CardTitle>
                            <CardAction>
                                <Button variant="link" className="cursor-pointer">View All</Button>
                            </CardAction>
                        </CardHeader>

                        <CardContent>
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>Website Modernization <Badge>Active</Badge> </ItemTitle>
                                    <ItemDescription>
                                        8 Applicants, posted 2 days ago
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Button variant="outline" className="cursor-pointer" size="sm">
                                        View
                                    </Button>
                                </ItemActions>
                            </Item>
                        </CardContent>                        
                    </Card>
                </div>
            </div>
            <div className="w-full md:w-1/3 mx-auto max-w-3xl space-y-6 min-h-full">
                <Card className="mx-5">
                    <CardContent className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar size="lg">
                                <AvatarImage src={avtImg.src} />
                                <AvatarFallback>ORG</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3>{currentUser?.orgName}</h3>
                        <p>{currentUser?.causeCategory}</p>
                    </CardContent>
                    <hr className="mx-10 border-gray-300" />
                    <CardContent>
                        <Button variant="ghost" className="text-xl py-6 cursor-pointer flex gap-3 cursor-pointer">
                            <UserRoundPen className="!w-7 !h-7 shrink-0"/>
                            View Profile
                        </Button>
                    </CardContent>
                    <CardContent>
                        <Button variant="ghost" onClick={signOut} className="text-xl py-6 cursor-pointer flex gap-3 cursor-pointer">
                            <LogOut className="!w-7 !h-7 shrink-0"/>
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
                        <Button variant="ghost" className="w-full text-md py-6 cursor-pointer flex items-center gap-3 cursor-pointer">
                            <MessageCircleQuestionMark className="!w-7 !h-7 shrink-0"/>
                            Contact Support
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
    );
}
