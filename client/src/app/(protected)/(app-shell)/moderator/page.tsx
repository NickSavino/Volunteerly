"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { ModStatCard } from "@/components/custom/mod_stat_card";
import { ModeratorTicketDetail } from "@volunteerly/shared";
import { Building2, Flag, Ticket } from "lucide-react";
import Image from "next/image";
import { useModDashboardViewModel } from "./ModDashboardVm";

export default function ModeratorDashboardPage() {
    const { loading, session, router, currentModerator, data, error } = useModDashboardViewModel();

    if (loading || !session) {
        return <LoadingScreen />;
    }

    function getSeverity(pastFlagsCount: number) {
        return pastFlagsCount >= 3 ? "HIGH" : "MEDIUM";
    }

    function getSeverityClasses(severity: ReturnType<typeof getSeverity>) {
        return severity === "HIGH" ? "bg-destructive text-white" : "bg-orange-500 text-white";
    }

    function getUrgencyClasses(urgency: ModeratorTicketDetail["urgencyRating"]) {
        switch (urgency) {
            case "SERIOUS":
                return "bg-destructive text-destructive-foreground";
            case "MODERATE":
                return "bg-orange-500 text-white";
            case "MINOR":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-secondary text-foreground";
        }
    }

    function formatCategory(category: ModeratorTicketDetail["category"]) {
        switch (category) {
            case "BUG":
                return "Platform Bug";
            case "ABUSE":
                return "Abuse Report";
            case "BILLING":
                return "Billing";
            case "OTHER":
                return "General Inquiry";
            default:
                return category;
        }
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <main
                className="
                    mx-auto max-w-7xl px-4 py-8
                    sm:px-6
                    lg:px-8
                "
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hello, {currentModerator?.firstName ?? "Moderator"}!
                    </h1>
                    <p className="text-sm text-gray-500">Moderator Dashboard</p>
                </div>

                {error && (
                    <p
                        className="
                            mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm
                            text-red-600
                        "
                    >
                        {error}
                    </p>
                )}

                <div
                    className="
                        mb-8 grid grid-cols-1 gap-4
                        sm:grid-cols-3
                    "
                >
                    <ModStatCard
                        icon={Building2}
                        label="Pending Organizations"
                        count={data.pendingOrgsCount}
                    />
                    <ModStatCard
                        icon={Flag}
                        label="Flagged Accounts"
                        count={data.flaggedAccountsCount}
                    />
                    <ModStatCard icon={Ticket} label="Open Tickets" count={data.openTicketsCount} />
                </div>

                <div
                    className="
                        grid grid-cols-1 gap-6
                        lg:grid-cols-3
                    "
                >
                    <div
                        className="
                            rounded-xl border bg-white p-6 shadow-sm
                            lg:col-span-2
                        "
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-800">
                                    Pending Organizations
                                </h2>
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

                        {data.recentPendingOrgs.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">
                                No Pending Organizations Found.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {data.recentPendingOrgs.map((org) => (
                                    <li
                                        key={org.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="
                                                    flex size-8 items-center justify-center
                                                    rounded-full bg-gray-100
                                                "
                                            >
                                                <Building2 className="size-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {org.orgName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Submitted{" "}
                                                    {new Date(org.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="
                                                rounded-md bg-yellow-400 px-3 py-1 text-sm
                                                font-medium text-black
                                                hover:bg-yellow-500
                                            "
                                            onClick={() =>
                                                router.push(
                                                    `/moderator/organizations?orgId=${org.id}&action=review`,
                                                )
                                            }
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

                        {data.recentFlaggedAccounts.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400">
                                No Flagged Accounts Found.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {data.recentFlaggedAccounts.map((volunteer) => {
                                        const severity = getSeverity(volunteer.pastFlagsCount);

                                        return (
                                            <div
                                                key={volunteer.id}
                                                className="rounded-xl border bg-gray-50 p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="
                                                            relative size-14 shrink-0
                                                            overflow-hidden rounded-xl bg-secondary
                                                        "
                                                    >
                                                        {volunteer.avatarUrl ? (
                                                            <Image
                                                                src={volunteer.avatarUrl}
                                                                alt={`${volunteer.firstName} ${volunteer.lastName}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="
                                                                    flex size-full items-center
                                                                    justify-center font-semibold
                                                                    text-gray-500
                                                                "
                                                            >
                                                                {volunteer.firstName[0]}
                                                                {volunteer.lastName[0]}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className="
                                                                truncate text-base font-semibold
                                                                text-gray-900
                                                            "
                                                        >
                                                            {volunteer.firstName}{" "}
                                                            {volunteer.lastName}
                                                        </p>
                                                        <p
                                                            className="
                                                                truncate text-sm text-gray-500
                                                            "
                                                        >
                                                            {volunteer.location}
                                                        </p>

                                                        {volunteer.flaggedByDisplayName ? (
                                                            <p
                                                                className="
                                                                    mt-1 text-xs text-gray-500
                                                                "
                                                            >
                                                                Flagged By:{" "}
                                                                {volunteer.flaggedByDisplayName}
                                                            </p>
                                                        ) : null}

                                                        {volunteer.latestFlagReason ? (
                                                            <p
                                                                className="
                                                                    mt-2 text-sm text-gray-700
                                                                "
                                                            >
                                                                {volunteer.latestFlagReason}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div
                                                    className="
                                                        mt-3 flex items-center justify-between gap-3
                                                    "
                                                >
                                                    <span
                                                        className={`
                                                            rounded-full px-3 py-1 text-[11px]
                                                            font-bold tracking-wide uppercase
                                                            ${getSeverityClasses(severity)}
                                                        `}
                                                    >
                                                        {severity}
                                                    </span>

                                                    <button
                                                        className="
                                                            rounded-md bg-yellow-400 px-3 py-1
                                                            text-sm font-medium text-black
                                                            hover:bg-yellow-500
                                                        "
                                                        onClick={() =>
                                                            router.push(
                                                                `/moderator/volunteers?volunteerId=${volunteer.id}&mode=profile`,
                                                            )
                                                        }
                                                    >
                                                        View Account
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex justify-center">
                                    <button
                                        className="
                                            rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium
                                            text-black
                                            hover:bg-yellow-500
                                        "
                                        onClick={() => router.push("/moderator/volunteers")}
                                    >
                                        View All
                                    </button>
                                </div>
                            </>
                        )}
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
                    {data.recentOpenTickets.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">No Tickets Found.</p>
                    ) : (
                        <div className="space-y-5">
                            {data.recentOpenTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="overflow-hidden rounded-xl border bg-white"
                                >
                                    <div
                                        className="
                                            flex flex-col gap-3 border-b px-5 py-4
                                            sm:flex-row sm:items-center sm:justify-between
                                        "
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-foreground">
                                                Ticket #{ticket.id.slice(-8).toUpperCase()}
                                            </h3>

                                            <span
                                                className="
                                                    rounded-full bg-blue-100 px-3 py-1 text-xs
                                                    font-bold tracking-wide text-blue-700 uppercase
                                                "
                                            >
                                                {formatCategory(ticket.category)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`
                                                    rounded-full px-4 py-1 text-xs font-bold
                                                    tracking-wide uppercase
                                                    ${getUrgencyClasses(ticket.urgencyRating)}
                                                `}
                                            >
                                                {ticket.urgencyRating}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                Awaiting Response
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="
                                            flex flex-col gap-4 px-5 py-4
                                            md:flex-row md:items-center md:justify-between
                                        "
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="
                                                    relative size-12 shrink-0 overflow-hidden
                                                    rounded-xl bg-secondary
                                                "
                                            >
                                                {ticket.issuer.avatarUrl ? (
                                                    <Image
                                                        src={ticket.issuer.avatarUrl}
                                                        alt={ticket.issuer.displayName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="
                                                            flex size-full items-center
                                                            justify-center font-semibold
                                                            text-gray-500
                                                        "
                                                    >
                                                        {ticket.issuer.displayName
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="font-semibold text-foreground">
                                                    {ticket.issuer.displayName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {ticket.issuer.role}
                                                </p>
                                                <p
                                                    className="
                                                        mt-2 text-sm font-medium text-foreground
                                                    "
                                                >
                                                    {ticket.title}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {ticket.description}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            className="
                                                rounded-md bg-yellow-400 px-3 py-1 text-sm
                                                font-medium text-black
                                                hover:bg-yellow-500
                                            "
                                            onClick={() =>
                                                router.push(
                                                    `/moderator/tickets?ticketId=${ticket.id}`,
                                                )
                                            }
                                        >
                                            View Ticket
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
