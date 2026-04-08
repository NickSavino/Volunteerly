"use client";

import { Building2, Flag, Ticket } from "lucide-react";
import { useModDashboardViewModel } from "./ModDashboardVm";
import { ModStatCard } from "@/components/custom/mod_stat_card";

export default function ModeratorDashboardPage() {
    const { loading, session, router, currentModerator, pendingOrgsCount, recentPendingOrgs, error } =
        useModDashboardViewModel();

    if (loading || !session) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="
                mx-auto max-w-7xl px-4 py-8
                sm:px-6
                lg:px-8
            ">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hello, {currentModerator?.firstName ?? "Moderator"}!
                    </h1>
                    <p className="text-sm text-gray-500">Moderator Dashboard</p>
                </div>

                {error && (
                    <p className="
                        mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm
                        text-red-600
                    ">
                        {error}
                    </p>
                )}

                <div className="
                    mb-8 grid grid-cols-1 gap-4
                    sm:grid-cols-3
                ">
                    <ModStatCard icon={Building2} label="Pending Organizations" count={pendingOrgsCount} />
                    <ModStatCard icon={Flag} label="Flagged Accounts" count={0} />
                    <ModStatCard icon={Ticket} label="Open Tickets" count={0} />
                </div>

                <div className="
                    grid grid-cols-1 gap-6
                    lg:grid-cols-3
                ">
                    <div className="
                        rounded-xl border bg-white p-6 shadow-sm
                        lg:col-span-2
                    ">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-800">Pending Organizations</h2>
                            </div>
                            <button
                                className="
                                    rounded-md bg-yellow-400 px-3 py-1 text-sm font-medium
                                    text-black
                                    hover:bg-yellow-500
                                "
                                onClick={() => router.push("/moderator/organizations")}
                            >
                                View All
                            </button>
                        </div>

                        {recentPendingOrgs.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">No Pending Organizations Found.</p>
                        ) : (
                            <ul className="divide-y">
                                {recentPendingOrgs.map((org) => (
                                    <li key={org.id} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="
                                                flex size-8 items-center justify-center rounded-full
                                                bg-gray-100
                                            ">
                                                <Building2 className="size-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{org.orgName}</p>
                                                <p className="text-xs text-gray-400">
                                                    Submitted{" "}
                                                    {new Date(org.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="
                                                rounded-md bg-yellow-400 px-3 py-1 text-sm
                                                font-medium text-black
                                                hover:bg-yellow-500
                                            "
                                            onClick={() => router.push("/moderator/organizations")}
                                        >
                                            View Application
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <h2 className="font-semibold text-gray-800">Flagged Accounts</h2>
                            <button
                                className="
                                    rounded-md bg-yellow-400 px-3 py-1 text-sm font-medium
                                    text-black
                                    hover:bg-yellow-500
                                "
                                onClick={() => router.push("/moderator/volunteers")}
                            >
                                View All
                            </button>
                        </div>
                        <p className="py-4 text-center text-sm text-gray-400">No Flagged Accounts Found.</p>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <h2 className="font-semibold text-gray-800">Tickets</h2>
                        <button
                            className="
                                rounded-md bg-yellow-400 px-3 py-1 text-sm font-medium text-black
                                hover:bg-yellow-500
                            "
                            onClick={() => router.push("/moderator/tickets")}
                        >
                            View All
                        </button>
                    </div>
                    <p className="py-8 text-center text-sm text-gray-400">No Tickets Found.</p>
                </div>
            </main>
        </div>
    );
}
