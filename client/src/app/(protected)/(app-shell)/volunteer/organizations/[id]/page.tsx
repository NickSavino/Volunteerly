"use client";

import { Briefcase, Globe, MapPin, Users } from "lucide-react";
import { use } from "react";
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
    const { loading, session, error, org, router } = useOrgPublicProfileViewModel(id);

    if (loading || !session) return <main className="p-6">Loading...</main>;

    return (
        <div className="min-h-screen bg-gray-50">
            <main
                className="
                    mx-auto max-w-5xl px-4 py-8
                    sm:px-6
                    lg:px-8
                "
            >
                <button
                    className="
                        mb-6 flex items-center gap-1 text-sm text-gray-500
                        hover:text-gray-800
                    "
                    onClick={() => router.back()}
                >
                    ← Back to Dashboard
                </button>

                {error && (
                    <p
                        className="
                            mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm
                            text-red-600
                        "
                    >
                        {error}
                    </p>
                )}

                {org && (
                    <>
                        <div
                            className="
                                relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-gray-800
                            "
                        >
                            <div
                                className="
                                    absolute inset-0 bg-linear-to-br from-gray-700 to-gray-900
                                "
                            />
                            <div className="absolute bottom-4 left-6 flex items-end gap-4">
                                <div
                                    className="
                                        flex size-16 items-center justify-center rounded-xl bg-white
                                        text-lg font-bold text-gray-800 shadow-sm
                                    "
                                >
                                    {org.orgName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{org.orgName}</h1>
                                    {org.causeCategory && (
                                        <span
                                            className="
                                                inline-flex items-center gap-1 rounded-full
                                                bg-yellow-400 px-2.5 py-0.5 text-xs font-medium
                                                text-black
                                            "
                                        >
                                            {org.causeCategory}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div
                                className="
                                    absolute right-6 bottom-2 flex flex-col items-end gap-0.5
                                "
                            >
                                {org.averageRating !== null ? (
                                    <>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const fill = Math.min(
                                                    1,
                                                    Math.max(
                                                        0,
                                                        (org.averageRating ?? 0) - (star - 1),
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
                                        <p className="text-xs text-gray-300">
                                            {org.averageRating.toFixed(1)} / 5.0
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Based on {org.reviewCount}{" "}
                                            {org.reviewCount === 1 ? "review" : "reviews"}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-400">No reviews yet</p>
                                )}
                            </div>
                        </div>

                        <div
                            className="
                                mb-6 grid grid-cols-2 gap-4
                                sm:grid-cols-4
                            "
                        >
                            <div className="rounded-xl border bg-white p-5 shadow-sm">
                                <div className="mb-3">
                                    <div className="w-fit rounded-md bg-gray-100 p-2">
                                        <Users className="size-5 text-gray-700" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Total Volunteers</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {formatStatValue(org.totalVolunteersHired)}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Hired across all opportunities
                                </p>
                            </div>

                            <div className="rounded-xl border bg-white p-5 shadow-sm">
                                <div className="mb-3">
                                    <div className="w-fit rounded-md bg-gray-100 p-2">
                                        <Briefcase className="size-5 text-gray-700" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Active Postings</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {org.activeOpportunities}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">Open opportunities now</p>
                            </div>

                            {org.impactHighlights.slice(0, 2).map((highlight, i) => (
                                <div key={i} className="rounded-xl border bg-white p-5 shadow-sm">
                                    <div className="mb-3">
                                        <div className="w-fit rounded-md bg-gray-100 p-2">
                                            <span className="text-base leading-none">✦</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {highlight.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {formatStatValue(highlight.value)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Organization metric
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 font-semibold text-gray-800">Public Information</h2>

                            {org.missionStatement && (
                                <div className="mb-5">
                                    <p
                                        className="
                                            mb-1 text-xs font-medium tracking-wide text-gray-400
                                            uppercase
                                        "
                                    >
                                        Mission Statement
                                    </p>
                                    <p className="text-sm text-gray-700">{org.missionStatement}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {org.causeCategory && (
                                    <div className="rounded-lg border p-4">
                                        <p
                                            className="
                                                mb-2 text-xs font-medium tracking-wide text-gray-400
                                                uppercase
                                            "
                                        >
                                            Cause Category
                                        </p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {org.causeCategory}
                                        </p>
                                    </div>
                                )}
                                {org.website && (
                                    <div className="rounded-lg border p-4">
                                        <p
                                            className="
                                                mb-2 text-xs font-medium tracking-wide text-gray-400
                                                uppercase
                                            "
                                        >
                                            Website
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="size-4 text-gray-400" />
                                            <a
                                                href={
                                                    org.website.startsWith("http")
                                                        ? org.website
                                                        : `https://${org.website}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="
                                                    text-sm text-blue-600
                                                    hover:underline
                                                "
                                            >
                                                {org.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {org.hqAdr && (
                                <div className="mt-4 rounded-lg border p-4">
                                    <p
                                        className="
                                            mb-2 text-xs font-medium tracking-wide text-gray-400
                                            uppercase
                                        "
                                    >
                                        Address
                                    </p>
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400" />
                                        <p className="text-sm whitespace-pre-line text-gray-700">
                                            {org.hqAdr}
                                        </p>
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
