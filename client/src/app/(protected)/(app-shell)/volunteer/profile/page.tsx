"use client";

import { useProfileViewModel } from "./profileVm";
import { UserService } from "@/services/UserService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { Settings, Pencil } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Rocket, Trophy, ShieldCheck, Handshake, Star, Award, type LucideIcon } from "lucide-react";
import { OrganizationLoadingPage } from "../../organization/organization_loading";

export default function ProfilePage() {
    const {
        currentVolunteer,
        editing,
        saving,
        errors,
        firstName, setFirstName,
        lastName, setLastName,
        location, setLocation,
        bio, setBio,
        availability,
        toggleDay,
        memberSince,
        handleEdit,
        handleCancel,
        handleSave,
        handleAvatarChange,
        fileInputRef,
        avatarKey,
        signOut,
        DAYS,
        loading,
        session,
        fetching,
        awards
    } = useProfileViewModel();

    if (loading || !session || fetching) {
        return (<OrganizationLoadingPage />)
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
        "Connector": Handshake,
        "Community Pillar": Handshake,
        "Changemaker": Handshake,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <title>Volunteer - Profile</title>
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">

                    <div className="flex flex-col gap-4 w-full lg:w-72 flex-shrink-0">
                        <div className="rounded-xl border bg-white p-6 flex flex-col items-center gap-3 shadow-sm">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage
                                        key={avatarKey}
                                        src={UserService.getAvatarURL(currentVolunteer.id)}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {currentVolunteer.firstName[0]}{currentVolunteer.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 text-gray-700 text-xs cursor-pointer h-7 w-7"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Pencil className="h-3 w-3" />
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
                                <p className="font-bold text-lg text-gray-900">{fullName}</p>
                                <p className="text-sm text-gray-400">Member since {memberSince}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col items-center gap-2">
                            <h2 className="font-semibold text-gray-800 text-lg">Your Rating</h2>
                            {currentVolunteer.reviewCount > 0 ? (
                                <>
                                    <div className="flex items-center gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const fill = Math.min(1, Math.max(0, currentVolunteer.averageRating - (star - 1)));
                                            const pct = Math.round(fill * 100);
                                            return (
                                                <span key={star} className="relative text-2xl leading-none">
                                                    <span className="text-gray-300">★</span>
                                                    <span
                                                        className="absolute inset-0 overflow-hidden text-yellow-400"
                                                        style={{ width: `${pct}%` }}
                                                    >★</span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {currentVolunteer.averageRating.toFixed(1)} / 5.0
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Based on {currentVolunteer.reviewCount} {currentVolunteer.reviewCount === 1 ? "review" : "reviews"}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 text-center">No reviews yet.</p>
                            )}
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col items-center gap-3">
                            <h2 className="font-semibold text-gray-800 text-lg mb-3">Milestones</h2>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {Object.entries(awards).length > 0 ? (
                                    Object.entries(awards).map(([title, description]) => {
                                        const Icon = awardIcons[title] || Award;
                                        return (
                                            <HoverCard key={title}>
                                                <HoverCardTrigger asChild>
                                                    <Button className="cursor-pointer">
                                                        <Icon className="w-5 h-5" />
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
                                    <p className="text-gray-500 text-sm">No milestones reached yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="h-5 w-5 text-gray-600" />
                                <p className="font-semibold text-gray-800">Technical Issues?</p>
                            </div>
                            <Button
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                                onClick={() => {}}
                            >
                                Submit a Ticket
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full min-h-full">
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        A complete profile increases your chances of being selected by organizations.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    {editing && (
                                        <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl px-6"
                                        onClick={editing ? handleSave : handleEdit}
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : editing ? "Save Edits" : "Edit Profile"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm flex-1 flex flex-col">
                            <h2 className="font-semibold text-gray-800 text-lg mb-5">General Information</h2>
                            <div className="flex flex-col gap-4 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input
                                            value={firstName}
                                            disabled={!editing}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name"
                                            className={`${!editing ? "text-gray-700" : ""} ${errors.firstName ? "border-destructive" : ""}`}
                                        />
                                        {errors.firstName && (
                                            <p className="text-destructive text-xs mt-1">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={lastName}
                                            disabled={!editing}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last name"
                                            className={`${!editing ? "text-gray-700" : ""} ${errors.lastName ? "border-destructive" : ""}`}
                                        />
                                        {errors.lastName && (
                                            <p className="text-destructive text-xs mt-1">{errors.lastName}</p>
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
                                        className={`${!editing ? "text-gray-700" : ""} ${errors.location ? "border-destructive" : ""}`}
                                    />
                                    {errors.location && (
                                        <p className="text-destructive text-xs mt-1">{errors.location}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 flex-1">
                                    <Label>Bio / About Me</Label>
                                    <Textarea
                                        value={bio}
                                        disabled={!editing}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Describe your passion for volunteering and what you hope to achieve..."
                                        className={`flex-1 resize-none ${!editing ? "text-gray-700" : ""} ${errors.bio ? "border-destructive" : ""}`}
                                    />
                                    {errors.bio && (
                                        <p className="text-destructive text-xs mt-1">{errors.bio}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Preferred Availability</Label>
                                    <div className="grid grid-cols-7 gap-1">
                                        {DAYS.map((day) => (
                                            <Toggle
                                                key={day}
                                                pressed={availability.includes(day)}
                                                onPressedChange={() => editing && toggleDay(day)}
                                                disabled={!editing}
                                                className={`w-full px-1 py-2 rounded-lg border text-xs font-medium transition-colors text-center
                                                    ${availability.includes(day)
                                                        ? "bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                                                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}
                                                    ${!editing ? "opacity-70 cursor-default" : "cursor-pointer"}`}
                                            >
                                                {day}
                                            </Toggle>
                                        ))}
                                    </div>
                                    {errors.availability && (
                                        <p className="text-destructive text-xs mt-1">{errors.availability}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}