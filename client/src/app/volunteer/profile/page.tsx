"use client";

import { useProfileViewModel } from "./profileVm";
import { VolunteerNavbar } from "../volunteer_navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import avtImg from "@/assets/avatarImg.png";

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
        memberSince,
        handleEdit,
        handleCancel,
        handleSave,
        signOut,
    } = useProfileViewModel();

    if (!currentVolunteer) {
        return <main className="p-6">Loading...</main>;
    }

    const fullName = `${currentVolunteer.firstName} ${currentVolunteer.lastName}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <title>Volunteer - Profile</title>
            <VolunteerNavbar currentVolunteer={currentVolunteer} onSignOut={signOut} />
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    <div className="flex flex-col gap-4 w-full lg:w-72 flex-shrink-0">
                        <div className="rounded-xl border bg-white p-6 flex flex-col items-center gap-3 shadow-sm">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={avtImg.src} />
                                <AvatarFallback className="text-2xl">
                                    {currentVolunteer.firstName[0]}{currentVolunteer.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="font-bold text-lg text-gray-900">{fullName}</p>
                                <p className="text-sm text-gray-400">Member since {memberSince}</p>
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


            <div className="flex flex-col gap-4 w-full">
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

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-800 text-lg mb-5">General Information</h2>
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input
                                            value={firstName}
                                            disabled={!editing}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name"
                                            className={!editing ? "text-gray-700" : ""}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={lastName}
                                            disabled={!editing}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last name"
                                            className={!editing ? "text-gray-700" : ""}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Location</Label>
                                    <Input
                                        value={location}
                                        disabled={!editing}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Calgary, AB"
                                        className={!editing ? "text-gray-700" : ""}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Bio / About Me</Label>
                                    <Textarea
                                        value={bio}
                                        disabled={!editing}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Describe your passion for volunteering and what you hope to achieve..."
                                        rows={4}
                                        className={!editing ? "text-gray-700" : ""}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}