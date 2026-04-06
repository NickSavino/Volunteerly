"use client";

import { MessageCircleQuestionMark, ArrowLeft, Pencil, Trophy, Rocket, ShieldCheck, LucideIcon, Award} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrgProfileViewModel } from "./orgProfileVm";
import {
  Field,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserService } from "@/services/UserService";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { LoadingScreen } from "@/components/common/loading-screen";

const awardIcons: Record<string, LucideIcon> = {
  "First Step": Rocket,
  "Community Builder": Trophy,
  "Strong Presence": ShieldCheck,
};

export default function OrgProfilePage() {
  const {loading, session, fetching, signOut, router, currentOrg,setCurrentOrg, 
    address, setAddress, viewSubmittedDoc, editing, setEditing, handleSubmit, resetEdit, 
    impactHighlights, setImpactHighlights, reviewSummary, fileInputRef, handleAvatarChange, awards} = useOrgProfileViewModel()

  if (loading || !session || fetching) {
    return (<LoadingScreen />)
  }

  return (
    <div className="min-h-screen">
        <title>Organization Profile - Volunteerly</title>
        <main className="md:h-[calc(100vh-64px)] md:px-10 py-5">
            <Button
                variant="ghost"
                className="cursor-pointer pb-8"
                onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
            </Button>

            <div className="relative mb-6 min-h-48 w-full overflow-hidden rounded-xl bg-gray-800 md:h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                <div className="absolute md:bottom-4 top-4 left-6 flex items-end gap-4">
                    <div className="relative">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={UserService.getAvatarURL(currentOrg?.id || "")}/>
                            <AvatarFallback> {currentOrg?.orgName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button className="absolute bottom-0 right-0 bg-white rounded-full p-1 text-gray-700 text-xs cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Pencil />
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleAvatarChange}
                        />                    
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{currentOrg?.orgName}</h1>
                        <p className="text-sm font-bold text-white">Member Since {new Date(currentOrg?.createdAt || "").toLocaleDateString()}</p>
                        {currentOrg?.causeCategory && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-medium text-black">
                                {currentOrg?.causeCategory}
                            </span>
                        )}
                    </div>
                </div>  
                <div className="absolute bottom-4 right-6 flex flex-col gap-2 text-center">
                    <div className="flex flex-row gap-2 justify-end">
                        {Object.entries(awards).map(([title, description]) => {
                            const Icon = awardIcons[title] || Award
                            return (
                            <HoverCard key={title}>
                                <HoverCardTrigger asChild>
                                    <Button className="cursor-pointer"><Icon /></Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="flex w-64 flex-col gap-0.5 pl-3">
                                    <div className="font-semibold">{title}</div>
                                    <div>{description}</div>
                                </HoverCardContent>
                            </HoverCard>
                            )
                        })}
                    </div>

                    {(reviewSummary.totalReviews || 0) > 0 &&
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Button className="cursor-pointer" variant={"ghost"}>
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const fill = Math.min(1, Math.max(0, (reviewSummary.avgRating ?? 0) - (star - 1)));
                                        const pct = Math.round(fill * 100);
                                        return (
                                            <span key={star} className="relative text-2xl leading-none">
                                                <span className="text-gray-500">★</span>
                                                <span
                                                    className="absolute inset-0 overflow-hidden text-primary"
                                                    style={{ width: `${pct}%` }}
                                                >★</span>
                                            </span>
                                        );
                                    })}

                                </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="flex w-64 flex-col gap-0.5 pl-3">
                                <div className="font-semibold">Rating {reviewSummary.avgRating || 0} / 5</div>
                                <div>Based on {reviewSummary.totalReviews} Review(s)</div>
                            </HoverCardContent>
                        </HoverCard>
                    }
                </div>
            </div>            

            <div className="flex flex-col md:flex-row pb-6 px-3">
                <div className="w-full mb-5 md:mb-0 md:w-2/3 mx-auto max-w-3x1 flex flex-col min-h-full gap-6">
                    <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Public Details</CardTitle>
                                <CardAction> 
                                    {editing ?
                                    <Button type="button" variant={"outline"} className="cursor-pointer" onClick={() => resetEdit()}>Cancel</Button>
                                    :<Button type="button" variant={"outline"} className="cursor-pointer" onClick={() => setEditing(true)}>Edit</Button>
                                    }
                                </CardAction>
                            </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-3">
                                <Field>
                                    <Label className="text-muted-foreground text-lg">Mission Statement</Label>
                                    {!editing ? 
                                    <Label className="text-md">{currentOrg?.missionStatement}</Label> : 
                                    <Textarea id="mission_statement" placeholder="Briefly describe your organization's core mission and goals." value={currentOrg?.missionStatement}
                                        onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, missionStatement: e.target.value } : prev)} required/>
                                    }
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field>
                                        <Label className="text-muted-foreground text-lg">Cause Category</Label>
                                        {!editing ? 
                                        <Label className="text-md">{currentOrg?.causeCategory}</Label> : 
                                        <Input id="causeCategory" type="text" placeholder="Education" value={currentOrg?.causeCategory}
                                        onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, causeCategory: e.target.value } : prev)} required/>
                                        }                                    
                                    </Field>
                                    <Field>
                                    <Label className="text-muted-foreground text-lg">Website</Label>
                                        {!editing ? 
                                        <Label className="text-md"><a href={currentOrg?.website} className="hover:underline text-blue-600" >{currentOrg?.website}</a></Label>: 
                                        <InputGroup id="website">
                                            <InputGroupInput id="website" type="text" placeholder="example.org" value={currentOrg?.website}
                                            onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, website: e.target.value } : prev)} required/>
                                            <InputGroupAddon>
                                            <InputGroupText>https://</InputGroupText>
                                            </InputGroupAddon>              
                                        </InputGroup>
                                        }

                                    </Field>                            
                                </div>
                                <Field>
                                    <Label className="text-muted-foreground text-lg">Address</Label>
                                    {!editing ? 
                                        <Label className="text-md">{currentOrg?.hqAdr}</Label> : 
                                        <div className="space-y-3">
                                            <Field>
                                            <Label htmlFor="address">Street Address<span className="text-destructive">*</span></Label>
                                            <Input id="address" type="text" placeholder="2500 University Dr NW" value={address.streetAdr}
                                                onChange={(e) => setAddress((prev) => prev ? { ...prev, streetAdr: e.target.value } : prev)} required/>
                                            </Field>
                                            <Field>
                                            <Label htmlFor="city">City<span className="text-destructive">*</span></Label>
                                            <Input id="city" type="text" placeholder="Calgary" value={address.city}
                                                onChange={(e) => setAddress((prev) => prev ? { ...prev, city: e.target.value } : prev)} required/>
                                            </Field>

                                            <Field>
                                            <Label htmlFor="province">Province<span className="text-destructive">*</span></Label>
                                            <Select value={address.province} onValueChange={(e) => setAddress((prev) => prev ? { ...prev, province: e } : prev)} required>
                                                <SelectTrigger id="province">
                                                <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                <SelectItem value="AB">Alberta</SelectItem>
                                                <SelectItem value="BC">British Columbia</SelectItem>
                                                <SelectItem value="MB">Manitoba</SelectItem>
                                                <SelectItem value="NB">New Brunswick</SelectItem>
                                                <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                                                <SelectItem value="NS">Nova Scotia</SelectItem>
                                                <SelectItem value="ON">Ontario</SelectItem>
                                                <SelectItem value="PE">Prince Edward Island</SelectItem>
                                                <SelectItem value="QC">Quebec</SelectItem>
                                                <SelectItem value="SK">Saskatchewan</SelectItem>
                                                <SelectItem value="NT">Northwest Territories</SelectItem>
                                                <SelectItem value="NU">Nunavut</SelectItem>
                                                <SelectItem value="YT">Yukon</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            </Field>
                                            
                                            <Field>
                                            <Label htmlFor="postalCode">Postal Code<span className="text-destructive">*</span></Label>
                                            <Input id="postalCode" type="text" placeholder="T2N 1N4" value={address.postalCode}
                                                onChange={(e) => setAddress((prev) => prev ? { ...prev, postalCode: e.target.value } : prev)} required/>
                                            </Field>
                                        </div>
                                        }                                
                                </Field>

                                <hr className="mx-2 border-gray-300" />
                                <CardTitle className="text-xl">Impact Highlights</CardTitle>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {((!currentOrg?.impactHighlights) ||  (currentOrg?.impactHighlights.length == 0)) && !editing &&
                                        <p>No Highlights</p>
                                    }
                                    {!editing?  
                                        <>
                                            {currentOrg?.impactHighlights?.map((item, index) => {
                                                const [[key, value]] = Object.entries(item);
                                                return (<Field key={index}>
                                                    <Label className="text-muted-foreground text-lg">{key}</Label>
                                                    <Label className="text-md">{value as string}</Label>
                                                </Field>)
                                            }
                                            )}
                                        </>
                                    :
                                        <>
                                            <Field>
                                                <Input id="impact1Label" type="text" value={impactHighlights.first.label}
                                                    onChange={(e) => setImpactHighlights((prev) => prev ? { ...prev, first: { ...prev.first, label: e.target.value } } : prev)} required/>
                                                <Input id="impact1Value" type="text" value={impactHighlights.first.value}
                                                    onChange={(e) => setImpactHighlights((prev) => prev ? { ...prev, first: { ...prev.first, value: e.target.value } } : prev)} required/>
                                            </Field>

                                            <Field>
                                                <Input id="impact2Label" type="text" value={impactHighlights.second.label}
                                                    onChange={(e) => setImpactHighlights((prev) => prev ? { ...prev, second: { ...prev.second, label: e.target.value } } : prev)} required/>
                                                <Input id="impact2Value" type="text" value={impactHighlights.second.value}
                                                    onChange={(e) => setImpactHighlights((prev) => prev ? { ...prev, second: { ...prev.second, value: e.target.value } } : prev)} required/>
                                            </Field>
                                        </>
                                    }                                                   
                                </div>
                        </CardContent>
                        {editing && 
                            <CardFooter className="pt-5 cursor-pointer">
                                <Button type="submit" variant={"outline"} className="cursor-pointer w-full">Save</Button>
                            </CardFooter>
                        }
                        </form>
                    </Card>
                </div>
                <div className="w-full md:w-1/3 mx-auto max-w-3xl space-y-6 h-full ">
                    <Card className="md:ml-5">
                         <CardHeader>
                            <CardTitle className="text-xl">Private Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Field>
                                <Label className="text-muted-foreground text-lg">Charity Number</Label>
                                <Label className="text-sm">{currentOrg?.charityNum}</Label>
                            </Field>

                            <Field>
                                <Label className="text-muted-foreground text-lg">Primary Contact</Label>
                                <Label className="text-sm">{currentOrg?.contactName}, {currentOrg?.contactNum}, {currentOrg?.contactEmail}</Label>
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