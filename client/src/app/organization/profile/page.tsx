"use client";

import { UserRoundPen, LogOut, MessageCircleQuestionMark, ArrowLeft} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizationNavbar } from "../organization_navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avtImg from "@/assets/avatarImg.png"
import { OrganizationLoadingPage } from "../organization_loading";
import { useOrgProfileViewModel } from "./orgProfileVm";
import {
  Field,
  FieldDescription,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export default function OrgProfilePage() {
  const {loading, session, fetching, signOut, router, currentOrg, address, viewSubmittedDoc} = useOrgProfileViewModel()

  if (loading || !session || fetching) {
    return (<OrganizationLoadingPage />)
  }

  return (
    <div className="min-h-screen">
        <title>Organization Dashboard - Volunteerly</title>
        <OrganizationNavbar
                    currentOrg={currentOrg}
                    onSignOut={async () => {
                        await signOut();
                        router.push("/");
                    }}
                />    
        <main className="md:h-[calc(100vh-64px)] px-6">
            <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
            </Button>

            <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                <div className="absolute bottom-4 left-6 flex items-end gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-800 shadow">
                        {currentOrg?.orgName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{currentOrg?.orgName}</h1>
                        {currentOrg?.causeCategory && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-medium text-black">
                                {currentOrg?.causeCategory}
                            </span>
                        )}
                    </div>
                </div>
            </div>            

            <div className="flex flex-col md:flex-row pb-6 px-3">
                <div className="w-full mb-5 md:mb-0 md:w-2/3 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                    <h3>Public Details</h3>
                    <Card>
                        <CardContent className="space-y-3">
                            <CardTitle className="text-xl">General Information</CardTitle>
                            <Field>
                                <Label className="text-muted-foreground text-lg">Mission Statement</Label>
                                <Label className="text-md">{currentOrg?.missionStatement}</Label>
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field>
                                    <Label className="text-muted-foreground text-lg">Cause Category</Label>
                                    <Label className="text-md">{currentOrg?.causeCategory}</Label>
                                </Field>
                                <Field>
                                <Label className="text-muted-foreground text-lg">Website</Label>
                                <Label className="text-md"><a href={currentOrg?.website}>{currentOrg?.website}</a></Label>
                                </Field>                            
                            </div>
                            <Field>
                                <Label className="text-muted-foreground text-lg">Address</Label>
                                <Label className="text-md">{currentOrg?.hqAdr}</Label>
                            </Field>
                            <CardTitle className="text-xl">Impact Highlights</CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentOrg?.impactHighlights?.map((item, index) => {
                                    const [[key, value]] = Object.entries(item);
                                    return (<Field key={index}>
                                        <Label className="text-muted-foreground text-lg">{key}</Label>
                                        <Label className="text-md">{value as string}</Label>
                                    </Field>)
                                }
                                )}                      
                            </div>
                    </CardContent>
                    </Card>
                </div>
                <div className="w-full md:w-1/3 mx-auto max-w-3xl space-y-6 h-full ">
                    <h3 className="mx-5">Private Details</h3>
                    <Card className="mx-5">
                        <CardContent className="space-y-3">
                            <Field>
                                <Label className="text-muted-foreground text-lg">Charity Number</Label>
                                <Label className="text-sm">{currentOrg?.charityNum}</Label>
                            </Field>

                            <Field>
                                <Label className="text-muted-foreground text-lg">Primary Contact</Label>
                                <Label className="text-sm">{currentOrg?.contactName}, {currentOrg?.contactNum}</Label>
                                <Label className="text-xs">{currentOrg?.contactEmail}</Label>
                            </Field>
                            <Field>
                                <Label className="text-muted-foreground text-lg">Verification Document</Label>
                                <Button onClick={viewSubmittedDoc} className="cursor-pointer">View Document</Button>
                            </Field>
                            <hr className="mx-2 border-gray-300" />
                            <CardDescription>Due to platform integrity, our moderator team can help you update private information.</CardDescription>
                            <Button variant="ghost" className="w-full text-md py-6 cursor-pointer flex items-center gap-3 cursor-pointer">
                                <MessageCircleQuestionMark className="!w-7 !h-7 shrink-0"/>
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
    

        </main>
    </div>
    );
}