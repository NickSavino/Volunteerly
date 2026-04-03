"use client";

import { use } from "react";
import { Globe, MapPin, Users, Briefcase } from "lucide-react";
import { VolunteerNavbar } from "@/components/volunteer/volunteer-navbar";
import { useOrgPublicProfileViewModel } from "./orgPublicProfileVm";

function formatStatValue(value: number): string {
    if (value >= 1000) {
        const shortened = value / 1000;
        return shortened % 1 === 0 ? `${shortened}k` : `${shortened.toFixed(1)}k`;
    }
    return value.toString();
}

export default function OrgPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        loading, session, error, org, currentVolunteer, handleSignOut, router,
    } = useOrgPublicProfileViewModel(id);

    if (loading || !session) return <main className="p-6">Loading...</main>;

    return (
        <div className="min-h-screen bg-gray-50">
            <VolunteerNavbar currentVolunteer={currentVolunteer} onSignOut={handleSignOut} />

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                <button
                    className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
                    onClick={() => router.back()}
                >
                    ← Back to Dashboard
                </button>

                {error && (
                    <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {org && (
                    <>
                        <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-gray-800">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                            <div className="absolute bottom-4 left-6 flex items-end gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-800 shadow">
                                    {org.orgName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{org.orgName}</h1>
                                    {org.causeCategory && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-medium text-black">
                                            {org.causeCategory}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl border bg-white p-5 shadow-sm">
                                <div className="mb-3">
                                    <div className="rounded-md bg-gray-100 p-2 w-fit">
                                        <Users className="h-5 w-5 text-gray-700" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Total Volunteers</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">{formatStatValue(org.totalVolunteersHired)}</p>
                                <p className="mt-1 text-xs text-gray-400">Hired across all opportunities</p>
                            </div>

                            <div className="rounded-xl border bg-white p-5 shadow-sm">
                                <div className="mb-3">
                                    <div className="rounded-md bg-gray-100 p-2 w-fit">
                                        <Briefcase className="h-5 w-5 text-gray-700" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Active Postings</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">{org.activeOpportunities}</p>
                                <p className="mt-1 text-xs text-gray-400">Open opportunities now</p>
                            </div>

                            {org.impactHighlights.slice(0, 2).map((highlight, i) => (
                                <div key={i} className="rounded-xl border bg-white p-5 shadow-sm">
                                    <div className="mb-3">
                                        <div className="rounded-md bg-gray-100 p-2 w-fit">
                                            <span className="text-base leading-none">✦</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">{highlight.label}</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatStatValue(highlight.value)}</p>
                                    <p className="mt-1 text-xs text-gray-400">Organization metric</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 font-semibold text-gray-800">Public Information</h2>

                            {org.missionStatement && (
                                <div className="mb-5">
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Mission Statement</p>
                                    <p className="text-sm text-gray-700">{org.missionStatement}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {org.causeCategory && (
                                    <div className="rounded-lg border p-4">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Cause Category</p>
                                        <p className="text-sm font-medium text-gray-800">{org.causeCategory}</p>
                                    </div>
                                )}
                                {org.website && (
                                    <div className="rounded-lg border p-4">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Website</p>
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="h-4 w-4 text-gray-400" />
                                            <a
                                                href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {org.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {org.hqAdr && (
                                <div className="mt-4 rounded-lg border p-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Address</p>
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{org.hqAdr}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}