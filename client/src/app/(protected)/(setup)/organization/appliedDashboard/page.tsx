"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, LogOut, MessageCircleQuestionMark, User } from "lucide-react";
import { Navbar } from "../application/navbar";
import { useAppliedOrgDashboardViewModel } from "./appliedDashboardVm";

export default function HomePage() {
    const { loading, session, router, signOut, currentOrganization } =
        useAppliedOrgDashboardViewModel();

    if (loading || !session || !currentOrganization) {
        return <LoadingScreen />;
    }
    return (
        <div className="min-h-screen">
            <title>Organization Dashboard - Volunteerly</title>
            <Navbar
                name={currentOrganization?.orgName || "Organization"}
                role={"Unverified"}
                onLogout={signOut}
            ></Navbar>

            <main
                className="
                    flex flex-col p-6
                    md:h-[calc(100vh-64px)] md:flex-row
                "
            >
                <div
                    className="
                        max-w-3xl mx-auto mb-5 flex min-h-full w-full flex-col gap-6
                        md:mb-0 md:w-2/3
                    "
                >
                    <div className="flex h-full flex-col justify-center text-center">
                        <h1 className="text-2xl font-bold">
                            Welcome, {currentOrganization?.orgName}
                        </h1>
                        <div className="m-5 rounded-sm bg-warning p-5">
                            {currentOrganization?.status === "REJECTED" ? (
                                <>
                                    <h1>Application Rejected</h1>
                                    <p>{currentOrganization.rejectionReason}</p>
                                    <p>Please Open a Ticket to dispute this decision.</p>
                                </>
                            ) : (
                                <>
                                    <h1>Awaiting Approval</h1>
                                    <p>Our Moderator Team will review your application shortly.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div
                    className="
                        mx-auto min-h-full w-full max-w-3xl space-y-6
                        md:w-1/3
                    "
                >
                    <Card className="mx-5">
                        <CardContent className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Avatar size="lg">
                                    <AvatarImage>
                                        <User />{" "}
                                    </AvatarImage>
                                    <AvatarFallback>ORG</AvatarFallback>
                                </Avatar>
                            </div>
                            <h3>{currentOrganization?.orgName}</h3>
                            <p>{currentOrganization?.causeCategory}</p>
                        </CardContent>
                        <hr className="mx-10 border-gray-300" />
                        <CardContent>
                            <Button
                                variant="ghost"
                                className="flex cursor-pointer gap-3 py-6 text-lg"
                                onClick={async () => {
                                    router.push("/organization/application");
                                }}
                            >
                                <FileText className="size-5! shrink-0" />
                                View Application
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

                    <Card className="mx-5">
                        <CardHeader>
                            <CardTitle>Need Help?</CardTitle>
                            <CardDescription>
                                Please email our moderator team for assistance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <a href="mailto:support@volunteerly.com">
                                <Button
                                    variant="ghost"
                                    className="
                                        text-base flex w-full cursor-pointer items-center gap-3 py-6
                                    "
                                >
                                    <MessageCircleQuestionMark className="size-7! shrink-0" />
                                    Contact Support
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
