"use client";

import { useProfileViewModel } from "./profileVm";
import { VolunteerNavbar } from "../volunteer_navbar";

export default function ProfilePage() {
    const { currentVolunteer, signOut } = useProfileViewModel();

    if (!currentVolunteer) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <title>Volunteer - Profile</title>
            <VolunteerNavbar
                currentVolunteer={currentVolunteer}
                onSignOut={signOut}
            />
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            </main>
        </div>
    );
}