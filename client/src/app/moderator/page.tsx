"use client";

import { Building2, Flag, Ticket } from "lucide-react";
import { useModDashboardViewModel } from "./ModDashboardVm";
import { ModeratorNavbar } from "@/components/custom/moderator_navbar";
import { ModStatCard } from "@/components/custom/mod_stat_card";
import { Button } from "@/components/ui/button";

export default function ModeratorDashboardPage() {
    const { loading, session, signOut, router, currentUser, dashboardSummary, error } =
        useModDashboardViewModel();

    if (loading || !session) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ModeratorNavbar currentUser={currentUser} onSignOut={signOut} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hello, {currentUser?.firstName ?? "Moderator"}!
                    </h1>
                    <p className="text-sm text-gray-500">Moderation Dashboard</p>
                </div>

                {error && (
                    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <ModStatCard
                        icon={Building2}
                        label="Pending Organizations"
                        count={dashboardSummary?.pendingOrganizationsCount ?? 0}
                    />
                    <ModStatCard
                        icon={Flag}
                        label="Flagged Accounts"
                        count={dashboardSummary?.flaggedAccountsCount ?? 0}
                    />
                    <ModStatCard
                        icon={Ticket}
                        label="Open Tickets"
                        count={dashboardSummary?.openTicketsCount ?? 0}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-800">Pending Organizations</h2>
                                <p className="text-xs text-gray-400">Documents pending review.</p>
                            </div>
                            <Button
                                size="sm"
                                className="bg-yellow-400 text-black hover:bg-yellow-500"
                                onClick={() => router.push("/moderator/organizations")}
                            >
                                View All
                            </Button>
                        </div>

                        {dashboardSummary?.recentPendingOrganizations.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">
                                No Organizations Found.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {dashboardSummary?.recentPendingOrganizations.map((org) => (
                                    <li
                                        key={org.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{org.name}</p>
                                            <p className="text-xs text-gray-400">{org.email}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.push(`/moderator/organizations/${org.id}`)
                                            }
                                        >
                                            Review
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-start justify-between">
                                <h2 className="font-semibold text-gray-800">Flagged Accounts</h2>
                                <Button
                                    size="sm"
                                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                                    onClick={() => router.push("/moderator/volunteers")}
                                >
                                    View All
                                </Button>
                            </div>

                            {dashboardSummary?.recentFlaggedAccounts.length === 0 ? (
                                <p className="py-4 text-center text-sm text-gray-400">
                                    No Tickets Found.
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {dashboardSummary?.recentFlaggedAccounts.map((account) => (
                                        <li key={account.id} className="py-3">
                                            <p className="text-sm font-medium text-gray-700">
                                                {account.firstName} {account.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">{account.email}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <h2 className="font-semibold text-gray-800">Tickets</h2>
                        <Button
                            size="sm"
                            className="bg-yellow-400 text-black hover:bg-yellow-500"
                            onClick={() => router.push("/moderator/tickets")}
                        >
                            View All
                        </Button>
                    </div>

                    {dashboardSummary?.recentTickets.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">No Tickets Found.</p>
                    ) : (
                        <ul className="divide-y">
                            {dashboardSummary?.recentTickets.map((ticket) => (
                                <li
                                    key={ticket.id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {ticket.subject}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {ticket.submittedByEmail} · {ticket.status}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.push(`/moderator/tickets/${ticket.id}`)
                                        }
                                    >
                                        View
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}