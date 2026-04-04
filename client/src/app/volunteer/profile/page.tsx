"use client";

import { useProfileViewModel } from "./profileVm";
import { VolunteerNavbar } from "../volunteer_navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import avtImg from "@/assets/avatarImg.png";

export default function ProfilePage() {
    const { currentVolunteer, signOut, memberSince } = useProfileViewModel();

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
                    </div>

                </div>
            </main>
        </div>
    );
}