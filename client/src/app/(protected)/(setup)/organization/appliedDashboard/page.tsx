"use client";

import { Button } from "@/components/ui/button";
import { useAppliedOrgDashboardViewModel } from "./appliedDashboardVm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import avtImg from "@/assets/avatarImg.png"
import { Avatar, AvatarFallback, AvatarImage,  } from "@/components/ui/avatar";
import { LogOut, MessageCircleQuestionMark, FileText, User } from "lucide-react";
import { Navbar } from "../application/navbar";

export default function HomePage() {
  const {loading, session, router, signOut, currentUser} = useAppliedOrgDashboardViewModel()

  if (loading || !session ) {
    return <main className="p-6">Loading...</main>
  }
  return (
    <div className="min-h-screen">
        <title>Organization Dashboard - Volunteerly</title>
        <Navbar name={currentUser?.orgName || "Organization"} role={"Unverified"} onLogout={signOut}></Navbar>
        
        <main className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] p-6 ">
    
            <div className="w-full mb-5 md:mb-0 md:w-2/3 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                <div className="flex flex-col justify-center h-full text-center">
                    <h1 className="text-2x1 font-bold">Welcome, {currentUser?.orgName}</h1>                   
                    <div className="bg-warning p-5 m-5 radius-2 rounded-sm">
                        {currentUser?.status === "REJECTED" ? 
                            <>
                                <h1>Application Rejected</h1>
                                <p>{currentUser.rejectionReason}</p>
                                <p>Please Open a Ticket to dispute this decision.</p>
                            </>
                            :
                            <>
                                <h1>Awaiting Approval</h1>
                                <p>Our Moderator Team will review your application shortly.</p>
                            </>
                        }
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/3 mx-auto max-w-3xl space-y-6 min-h-full">
                <Card className="mx-5">
                    <CardContent className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar size="lg">
                                <AvatarImage><User /> </AvatarImage>
                                <AvatarFallback>ORG</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3>{currentUser?.orgName}</h3>
                        <p>{currentUser?.causeCategory}</p>
                    </CardContent>
                    <hr className="mx-10 border-gray-300" />
                    <CardContent>
                        <Button variant="ghost" className="text-lg py-6 flex gap-3 cursor-pointer" onClick={async () => { router.push("/organization/application"); }}>
                            <FileText className="w-5! h-5! shrink-0"/>
                            View Application
                        </Button>
                    </CardContent>
                    <CardContent>
                        <Button variant="ghost" onClick={async () => { await signOut(); router.push("/"); }} className="text-lg py-6 cursor-pointer flex gap-3">
                            <LogOut className="w-5! h-5! shrink-0"/>
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
                        <Button variant="ghost" className="w-full text-md py-6 cursor-pointer flex items-center gap-3">
                            <MessageCircleQuestionMark className="w-7! h-7! shrink-0"/>
                            Contact Support
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
    );
}
