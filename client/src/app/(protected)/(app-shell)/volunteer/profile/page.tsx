/**
 * page.tsx
 * Volunteer profile page. Shows avatar, rating, milestones, and an editable general info form
 */
"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { SubmitTicketModal } from "@/components/common/tickets/submit-ticket-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { UserService } from "@/services/UserService";
import { Award, Handshake, Pencil, Rocket, Settings, Star, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useProfileViewModel } from "./profileVm";

export default function ProfilePage() {
    const {
        currentVolunteer,
        editing,
        saving,
        errors,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        location,
        setLocation,
        bio,
        setBio,
        availability,
        toggleDay,
        memberSince,
        handleEdit,
        handleCancel,
        handleSave,
        handleAvatarChange,
        fileInputRef,
        avatarKey,
        DAYS,
        loading,
        session,
        fetching,
        awards,
    } = useProfileViewModel();

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    if (!currentVolunteer) {
        return <main className="p-6">Loading...</main>;
    }

    const fullName = `${currentVolunteer.firstName} ${currentVolunteer.lastName}`;

    const awardIcons: Record<string, LucideIcon> = {
        "Profile Pro": Star,

        "First Step": Rocket,
        "Active Volunteer": Rocket,
        "Master Volunteer": Rocket,
        "Legendary Volunteer": Rocket,

        "Helping Hand": Handshake,
        Connector: Handshake,
        "Community Pillar": Handshake,
        Changemaker: Handshake,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <title>Volunteer - Profile</title>
            <main
                className="
                    mx-auto max-w-5xl px-4 py-10
                    sm:px-6
                    lg:px-8
                "
            >
                <div
                    className="
                        flex flex-col items-stretch gap-6
                        lg:flex-row
                    "
                >
                    {/* Left sidebar */}
                    <div
                        className="
                            flex w-full shrink-0 flex-col gap-4
                            lg:w-72
                        "
                    >
                        <div
                            className="
                                flex flex-col items-center gap-3 rounded-xl border bg-white p-6
                                shadow-sm
                            "
                        >
                            <div className="relative">
                                <Avatar className="size-24">
                                    <AvatarImage
                                        key={avatarKey}
                                        src={UserService.getAvatarURL(currentVolunteer.id)}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {currentVolunteer.firstName[0]}
                                        {currentVolunteer.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    className="
                                        absolute right-0 bottom-0 size-7 cursor-pointer rounded-full
                                        bg-white p-1 text-xs text-gray-700
                                    "
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Pencil className="size-3" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{fullName}</p>
                                <p className="text-sm text-gray-400">Member since {memberSince}</p>
                            </div>
                        </div>

                        <div
                            className="
                                flex flex-col items-center gap-2 rounded-xl border bg-white p-6
                                shadow-sm
                            "
                        >
                            <h2 className="text-lg font-semibold text-gray-800">Your Rating</h2>
                            {currentVolunteer.reviewCount > 0 ? (
                                <>
                                    <div className="mt-1 flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const fill = Math.min(
                                                1,
                                                Math.max(
                                                    0,
                                                    currentVolunteer.averageRating - (star - 1),
                                                ),
                                            );
                                            const pct = Math.round(fill * 100);
                                            return (
                                                <span
                                                    key={star}
                                                    className="relative text-2xl leading-none"
                                                >
                                                    <span className="text-gray-300">★</span>
                                                    <span
                                                        className="
                                                            absolute inset-0 overflow-hidden
                                                            text-yellow-400
                                                        "
                                                        style={{ width: `${pct}%` }}
                                                    >
                                                        ★
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {currentVolunteer.averageRating.toFixed(1)} / 5.0
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Based on {currentVolunteer.reviewCount}{" "}
                                        {currentVolunteer.reviewCount === 1 ? "review" : "reviews"}
                                    </p>
                                </>
                            ) : (
                                <p className="text-center text-sm text-gray-400">No reviews yet.</p>
                            )}
                        </div>

                        <div
                            className="
                                flex flex-col items-center gap-3 rounded-xl border bg-white p-6
                                shadow-sm
                            "
                        >
                            <h2 className="mb-3 text-lg font-semibold text-gray-800">Milestones</h2>
                            <div className="flex flex-wrap justify-center gap-2">
                                {Object.entries(awards).length > 0 ? (
                                    Object.entries(awards).map(([title, description]) => {
                                        const Icon = awardIcons[title] || Award;
                                        return (
                                            <HoverCard key={title}>
                                                <HoverCardTrigger asChild>
                                                    <Button className="cursor-pointer">
                                                        <Icon className="size-5" />
                                                    </Button>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="flex w-64 flex-col gap-0.5 pl-3">
                                                    <div className="font-semibold">{title}</div>
                                                    <div>{description}</div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No milestones reached yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <Settings className="size-5 text-gray-600" />
                                <p className="font-semibold text-gray-800">Technical Issues?</p>
                            </div>
                            <Button
                                className="
                                    cursor-pointer w-full bg-yellow-400
                                    hover:bg-yellow-500
                                    text-black font-semibold
                                "
                                onClick={() => setIsTicketModalOpen(true)}
                            >
                                Submit a Ticket
                            </Button>
                        </div>
                    </div>

                    <div className="flex min-h-full w-full flex-col gap-4">
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Edit Profile
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-500">
                                        A complete profile increases your chances of being selected
                                        by organizations.
                                    </p>
                                </div>
                                <div className="ml-4 flex shrink-0 items-center gap-2">
                                    {editing && (
                                        <Button
                                            variant="ghost"
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        className="
                                            cursor-pointer bg-yellow-400
                                            hover:bg-yellow-500
                                            text-black font-semibold rounded-xl px-6
                                        "
                                        onClick={editing ? handleSave : handleEdit}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editing
                                              ? "Save Edits"
                                              : "Edit Profile"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="
                                flex flex-1 flex-col rounded-xl border bg-white p-6 shadow-sm
                            "
                        >
                            <h2 className="mb-5 text-lg font-semibold text-gray-800">
                                General Information
                            </h2>
                            <div className="flex flex-1 flex-col gap-4">
                                <div
                                    className="
                                        grid grid-cols-1 gap-4
                                        md:grid-cols-2
                                    "
                                >
                                    <div className="flex flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input
                                            value={firstName}
                                            disabled={!editing}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name"
                                            className={`
                                                ${!editing ? "text-gray-700" : ""}
                                                ${errors.firstName ? "border-destructive" : ""}
                                            `}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.firstName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={lastName}
                                            disabled={!editing}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last name"
                                            className={`
                                                ${!editing ? "text-gray-700" : ""}
                                                ${errors.lastName ? "border-destructive" : ""}
                                            `}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.lastName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Location</Label>
                                    <Input
                                        value={location}
                                        disabled={!editing}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Calgary, AB"
                                        className={`
                                            ${!editing ? "text-gray-700" : ""}
                                            ${errors.location ? "border-destructive" : ""}
                                        `}
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.location}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col gap-1">
                                    <Label>Bio / About Me</Label>
                                    <Textarea
                                        value={bio}
                                        disabled={!editing}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Describe your passion for volunteering and what you hope to achieve..."
                                        className={`
                                            flex-1 resize-none
                                            ${!editing ? "text-gray-700" : ""}
                                            ${errors.bio ? "border-destructive" : ""}
                                        `}
                                    />
                                    {errors.bio && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.bio}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Preferred Availability</Label>
                                    <div
                                        className="
                                            grid grid-cols-1
                                            sm:grid-cols-3
                                            md:grid-cols-7
                                            gap-1
                                        "
                                    >
                                        {DAYS.map((day) => (
                                            <Toggle
                                                key={day}
                                                pressed={availability.includes(day)}
                                                onPressedChange={() => editing && toggleDay(day)}
                                                disabled={!editing}
                                                className={`
                                                    w-full rounded-lg border px-1 py-2 text-center
                                                    text-xs font-medium transition-colors
                                                    ${
                                                        availability.includes(day)
                                                            ? `
                                                                border-yellow-400 bg-yellow-400
                                                                text-black
                                                                hover:bg-yellow-500
                                                            `
                                                            : `
                                                                border-gray-300 bg-white
                                                                text-gray-600
                                                                hover:bg-gray-50
                                                            `
                                                    }
                                                    ${!editing ? "cursor-default opacity-70" : "cursor-pointer"}`}
                                            >
                                                {day}
                                            </Toggle>
                                        ))}
                                    </div>
                                    {errors.availability && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.availability}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <SubmitTicketModal
                open={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
            />
        </div>
    );
}
