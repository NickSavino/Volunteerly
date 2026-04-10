/**
 * page.tsx
 * Organization profile page - view and edit public details, view private details, manage avatar
 */

"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { SubmitTicketModal } from "@/components/common/tickets/submit-ticket-modal";
import { getAvatarFallback } from "@/components/navigation/nav-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserService } from "@/services/UserService";
import {
    ArrowLeft,
    Award,
    LucideIcon,
    MessageCircleQuestionMark,
    Pencil,
    Rocket,
    ShieldCheck,
    Trophy,
} from "lucide-react";
import { useState } from "react";
import { useOrgProfileViewModel } from "./orgProfileVm";

// Map award title strings to their corresponding lucide icons
const awardIcons: Record<string, LucideIcon> = {
    "First Step": Rocket,
    "Community Builder": Trophy,
    "Strong Presence": ShieldCheck,
};

export default function OrgProfilePage() {
    const {
        loading,
        session,
        fetching,
        router,
        currentOrg,
        setCurrentOrg,
        address,
        setAddress,
        viewSubmittedDoc,
        editing,
        setEditing,
        handleSubmit,
        resetEdit,
        impactHighlights,
        setImpactHighlights,
        reviewSummary,
        fileInputRef,
        handleAvatarChange,
        awards,
    } = useOrgProfileViewModel();

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Organization Profile - Volunteerly</title>
            <main
                className="
                    py-5
                    md:h-[calc(100vh-64px)] md:px-10
                "
            >
                <Button
                    variant="ghost"
                    className="cursor-pointer pb-8"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                {/* Hero banner with avatar, org name, cause category badge, awards, and rating */}
                <div
                    className="
                        relative mb-6 min-h-48 w-full overflow-hidden rounded-xl bg-gray-800
                        md:h-40
                    "
                >
                    <div className="absolute inset-0 bg-linear-to-br from-gray-700 to-gray-900" />
                    <div
                        className="
                            absolute top-4 left-6 flex items-end gap-4
                            md:bottom-4
                        "
                    >
                        {/* Avatar with pencil button overlay for uploading a new image */}
                        <div className="relative">
                            <Avatar className="size-20">
                                <AvatarImage src={UserService.getAvatarURL(currentOrg?.id || "")} />
                                <AvatarFallback>
                                    {" "}
                                    {getAvatarFallback(currentOrg?.orgName)}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                className="
                                    absolute right-0 bottom-0 cursor-pointer rounded-full bg-white
                                    p-1 text-xs text-gray-700
                                "
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Pencil />
                            </Button>
                            {/* Hidden file input triggered by the pencil button above */}
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
                            <p className="text-sm font-bold text-white">
                                Member Since{" "}
                                {new Date(currentOrg?.createdAt || "").toLocaleDateString()}
                            </p>
                            {currentOrg?.causeCategory && (
                                <span
                                    className="
                                        inline-flex items-center gap-1 rounded-full bg-yellow-400
                                        px-2.5 py-0.5 text-xs font-medium text-black
                                    "
                                >
                                    {currentOrg?.causeCategory}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Awards and star rating shown in the top right of the banner */}
                    <div className="absolute right-6 bottom-4 flex flex-col gap-2 text-center">
                        <div className="flex flex-row justify-end gap-2">
                            {Object.entries(awards).map(([title, description]) => {
                                // Fall back to generic Award icon for any unrecognized award titles
                                const Icon = awardIcons[title] || Award;
                                return (
                                    <HoverCard key={title}>
                                        <HoverCardTrigger asChild>
                                            <Button className="cursor-pointer">
                                                <Icon />
                                            </Button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="flex w-64 flex-col gap-0.5 pl-3">
                                            <div className="font-semibold">{title}</div>
                                            <div>{description}</div>
                                        </HoverCardContent>
                                    </HoverCard>
                                );
                            })}
                        </div>

                        {/* Partial fill star rating - only shown if the org has received reviews */}
                        {(reviewSummary.totalReviews || 0) > 0 && (
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <Button className="cursor-pointer" variant={"ghost"}>
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const fill = Math.min(
                                                1,
                                                Math.max(
                                                    0,
                                                    (reviewSummary.avgRating ?? 0) - (star - 1),
                                                ),
                                            );
                                            const pct = Math.round(fill * 100);
                                            return (
                                                <span
                                                    key={star}
                                                    className="relative text-2xl leading-none"
                                                >
                                                    <span className="text-gray-500">★</span>
                                                    <span
                                                        className="
                                                            absolute inset-0 overflow-hidden
                                                            text-primary
                                                        "
                                                        style={{ width: `${pct}%` }}
                                                    >
                                                        ★
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="flex w-64 flex-col gap-0.5 pl-3">
                                    <div className="font-semibold">
                                        Rating {reviewSummary.avgRating || 0} / 5
                                    </div>
                                    <div>Based on {reviewSummary.totalReviews} Review(s)</div>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </div>
                </div>

                <div
                    className="
                        flex flex-col px-3 pb-6
                        md:flex-row
                    "
                >
                    {/* Left column - editable public details and impact highlights */}
                    <div
                        className="
                            mx-auto mb-5 flex min-h-full w-full flex-col gap-6
                            md:mb-0 md:w-2/3
                        "
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Public Details</CardTitle>
                                <CardAction>
                                    {/* Toggle between Cancel and Edit based on editing state */}
                                    {editing ? (
                                        <Button
                                            type="button"
                                            variant={"outline"}
                                            className="cursor-pointer"
                                            onClick={() => resetEdit()}
                                        >
                                            Cancel
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant={"outline"}
                                            className="cursor-pointer"
                                            onClick={() => setEditing(true)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </CardAction>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-3">
                                    <Field>
                                        <Label className="text-lg text-muted-foreground">
                                            Mission Statement
                                        </Label>
                                        {/* Fields switch between read-only labels and editable inputs */}
                                        {!editing ? (
                                            <Label>{currentOrg?.missionStatement}</Label>
                                        ) : (
                                            <Textarea
                                                id="mission_statement"
                                                placeholder="Briefly describe your organization's core mission and goals."
                                                value={currentOrg?.missionStatement}
                                                onChange={(e) =>
                                                    setCurrentOrg((prev) =>
                                                        prev
                                                            ? {
                                                                  ...prev,
                                                                  missionStatement: e.target.value,
                                                              }
                                                            : prev,
                                                    )
                                                }
                                                required
                                            />
                                        )}
                                    </Field>
                                    <div
                                        className="
                                            grid grid-cols-1 gap-4
                                            md:grid-cols-2
                                        "
                                    >
                                        <Field>
                                            <Label className="text-lg text-muted-foreground">
                                                Cause Category
                                            </Label>
                                            {!editing ? (
                                                <Label>{currentOrg?.causeCategory}</Label>
                                            ) : (
                                                <Input
                                                    id="causeCategory"
                                                    type="text"
                                                    placeholder="Education"
                                                    value={currentOrg?.causeCategory}
                                                    onChange={(e) =>
                                                        setCurrentOrg((prev) =>
                                                            prev
                                                                ? {
                                                                      ...prev,
                                                                      causeCategory: e.target.value,
                                                                  }
                                                                : prev,
                                                        )
                                                    }
                                                    required
                                                />
                                            )}
                                        </Field>
                                        <Field>
                                            <Label className="text-lg text-muted-foreground">
                                                Website
                                            </Label>
                                            {!editing ? (
                                                <Label>
                                                    <a
                                                        href={currentOrg?.website}
                                                        className="
                                                            text-blue-600
                                                            hover:underline
                                                        "
                                                    >
                                                        {currentOrg?.website}
                                                    </a>
                                                </Label>
                                            ) : (
                                                <InputGroup id="website">
                                                    <InputGroupInput
                                                        id="website"
                                                        type="text"
                                                        placeholder="example.org"
                                                        value={currentOrg?.website}
                                                        onChange={(e) =>
                                                            setCurrentOrg((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          website: e.target.value,
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputGroupAddon>
                                                        <InputGroupText>https://</InputGroupText>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            )}
                                        </Field>
                                    </div>

                                    {/* Address field - shows combined string in view mode, separate inputs when editing */}
                                    <Field>
                                        <Label className="text-lg text-muted-foreground">
                                            Address
                                        </Label>
                                        {!editing ? (
                                            <Label>{currentOrg?.hqAdr}</Label>
                                        ) : (
                                            <div className="space-y-3">
                                                <Field>
                                                    <Label htmlFor="address">
                                                        Street Address
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        type="text"
                                                        placeholder="2500 University Dr NW"
                                                        value={address.streetAdr}
                                                        onChange={(e) =>
                                                            setAddress((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          streetAdr: e.target.value,
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </Field>
                                                <Field>
                                                    <Label htmlFor="city">
                                                        City
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        type="text"
                                                        placeholder="Calgary"
                                                        value={address.city}
                                                        onChange={(e) =>
                                                            setAddress((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          city: e.target.value,
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </Field>

                                                <Field>
                                                    <Label htmlFor="province">
                                                        Province
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select
                                                        value={address.province}
                                                        onValueChange={(e) =>
                                                            setAddress((prev) =>
                                                                prev
                                                                    ? { ...prev, province: e }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <SelectTrigger id="province">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="AB">
                                                                Alberta
                                                            </SelectItem>
                                                            <SelectItem value="BC">
                                                                British Columbia
                                                            </SelectItem>
                                                            <SelectItem value="MB">
                                                                Manitoba
                                                            </SelectItem>
                                                            <SelectItem value="NB">
                                                                New Brunswick
                                                            </SelectItem>
                                                            <SelectItem value="NL">
                                                                Newfoundland and Labrador
                                                            </SelectItem>
                                                            <SelectItem value="NS">
                                                                Nova Scotia
                                                            </SelectItem>
                                                            <SelectItem value="ON">
                                                                Ontario
                                                            </SelectItem>
                                                            <SelectItem value="PE">
                                                                Prince Edward Island
                                                            </SelectItem>
                                                            <SelectItem value="QC">
                                                                Quebec
                                                            </SelectItem>
                                                            <SelectItem value="SK">
                                                                Saskatchewan
                                                            </SelectItem>
                                                            <SelectItem value="NT">
                                                                Northwest Territories
                                                            </SelectItem>
                                                            <SelectItem value="NU">
                                                                Nunavut
                                                            </SelectItem>
                                                            <SelectItem value="YT">
                                                                Yukon
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>

                                                <Field>
                                                    <Label htmlFor="postalCode">
                                                        Postal Code
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="postalCode"
                                                        type="text"
                                                        placeholder="T2N 1N4"
                                                        value={address.postalCode}
                                                        onChange={(e) =>
                                                            setAddress((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          postalCode:
                                                                              e.target.value,
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </Field>
                                            </div>
                                        )}
                                    </Field>

                                    <hr className="mx-2 border-gray-300" />
                                    <CardTitle className="text-xl">Impact Highlights</CardTitle>

                                    {/* Impact highlights - two key-value pairs shown as labels or inputs */}
                                    <div
                                        className="
                                            grid grid-cols-1 gap-4
                                            md:grid-cols-2
                                        "
                                    >
                                        {(!currentOrg?.impactHighlights ||
                                            currentOrg?.impactHighlights.length == 0) &&
                                            !editing && <p>No Highlights</p>}
                                        {!editing ? (
                                            <>
                                                {currentOrg?.impactHighlights?.map(
                                                    (item, index) => {
                                                        const [[key, value]] = Object.entries(item);
                                                        return (
                                                            <Field key={index}>
                                                                <Label
                                                                    className="
                                                                        text-lg
                                                                        text-muted-foreground
                                                                    "
                                                                >
                                                                    {key}
                                                                </Label>
                                                                <Label>{value as string}</Label>
                                                            </Field>
                                                        );
                                                    },
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {/* First highlight - label and value inputs */}
                                                <Field>
                                                    <Input
                                                        id="impact1Label"
                                                        type="text"
                                                        value={impactHighlights.first.label}
                                                        onChange={(e) =>
                                                            setImpactHighlights((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          first: {
                                                                              ...prev.first,
                                                                              label: e.target.value,
                                                                          },
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        id="impact1Value"
                                                        type="text"
                                                        value={impactHighlights.first.value}
                                                        onChange={(e) =>
                                                            setImpactHighlights((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          first: {
                                                                              ...prev.first,
                                                                              value: e.target.value,
                                                                          },
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </Field>

                                                {/* Second highlight - label and value inputs */}
                                                <Field>
                                                    <Input
                                                        id="impact2Label"
                                                        type="text"
                                                        value={impactHighlights.second.label}
                                                        onChange={(e) =>
                                                            setImpactHighlights((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          second: {
                                                                              ...prev.second,
                                                                              label: e.target.value,
                                                                          },
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        id="impact2Value"
                                                        type="text"
                                                        value={impactHighlights.second.value}
                                                        onChange={(e) =>
                                                            setImpactHighlights((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          second: {
                                                                              ...prev.second,
                                                                              value: e.target.value,
                                                                          },
                                                                      }
                                                                    : prev,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </Field>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                                {editing && (
                                    <CardFooter className="cursor-pointer pt-5">
                                        <Button
                                            type="submit"
                                            variant={"outline"}
                                            className="w-full cursor-pointer"
                                        >
                                            Save
                                        </Button>
                                    </CardFooter>
                                )}
                            </form>
                        </Card>
                    </div>

                    {/* Right sidebar - read-only private details and support ticket link */}
                    <div
                        className="
                            mx-auto size-full max-w-3xl space-y-6
                            md:w-1/3
                        "
                    >
                        <Card className="md:ml-5">
                            <CardHeader>
                                <CardTitle className="text-xl">Private Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Field>
                                    <Label className="text-lg text-muted-foreground">
                                        Charity Number
                                    </Label>
                                    <Label className="text-sm">{currentOrg?.charityNum}</Label>
                                </Field>

                                <Field>
                                    <Label className="text-lg text-muted-foreground">
                                        Primary Contact
                                    </Label>
                                    <Label className="text-sm">
                                        {currentOrg?.contactName}, {currentOrg?.contactNum},{" "}
                                        {currentOrg?.contactEmail}
                                    </Label>
                                </Field>
                                <Field>
                                    <Label className="text-lg text-muted-foreground">
                                        Verification Document
                                    </Label>
                                    <Button onClick={viewSubmittedDoc} className="cursor-pointer">
                                        View Document
                                    </Button>
                                </Field>
                                <hr className="mx-2 border-gray-300" />
                                {/* Private details can only be changed via a moderator ticket */}
                                <CardDescription>
                                    Due to platform integrity, our moderator team can help you
                                    update private information.
                                </CardDescription>
                                <Button
                                    onClick={() => setIsTicketModalOpen(true)}
                                    variant="ghost"
                                    className="flex w-full cursor-pointer items-center gap-3 py-6"
                                >
                                    <MessageCircleQuestionMark className="size-7! shrink-0" />
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* After ticket submission, redirect to the new conversation thread */}
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