"use client";

import { usePathname } from "next/navigation";
import { Clock, Star, DollarSign, Building2 } from "lucide-react";
import { useState } from "react";

import { useVltDashboardViewModel, ChartRange } from "./vltDashboardVm";
import { SubmitTicketModal } from "@/components/common/tickets/submit-ticket-modal";

const STATUS_STYLES: Record<string, string> = {
    OPEN: "bg-green-50 text-green-700",
    FILLED: "bg-blue-50 text-blue-700",
    CLOSED: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-50 text-red-600",
};

const RANGE_LABELS: Record<ChartRange, string> = {
    last_month: "Last Month",
    last_6_months: "Last 6 Months",
    last_year: "Last Year",
    this_year: "This Year",
    total: "Total",
};

export default function VolunteerDashboardPage() {
    const {
        loading,
        session,
        error,
        currentVolunteer,
        opportunities,
        partnerOrgs,
        handleSignOut,
        firstName,
        totalHours,
        economicValue,
        impactScore,
        orgsAssisted,
        chartLabels,
        chartData,
        chartRange,
        setChartRange,
        router,
        hourlyRate,
        fetching,
    } = useVltDashboardViewModel();

    const pathname = usePathname();
    const fullName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";

    const [showAllPartners, setShowAllPartners] = useState(false);

    //if (loading || !session || fetching) {
    //    return (<VolunteerLoadingPage />)
    //}

    const maxHours = Math.max(...chartData, 1);

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <main
                className="
                    px=4 mx-auto max-w-7xl py-8
                    sm:px-6
                    lg:px-8
                "
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
                </div>

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

                {/* KPI Cards */}
                <div
                    className="
                        mb-8 grid grid-cols-2 gap-4
                        lg:grid-cols-4
                    "
                >
                    <StatCard
                        icon={<Clock className="size-5 text-gray-700" />}
                        label="Total Hours"
                        value={totalHours.toFixed(1)}
                        sub="Sum of your Hours"
                        trend={null}
                    />
                    <StatCard
                        icon={<Star className="size-5 text-gray-700" />}
                        label="Impact Score"
                        value={impactScore.toLocaleString()}
                        sub={`Across ${orgsAssisted} Org${orgsAssisted !== 1 ? "s" : ""}`}
                        trend={null}
                    />
                    <StatCard
                        icon={<DollarSign className="size-5 text-gray-700" />}
                        label="Economic Value"
                        value={`$${economicValue.toLocaleString()}`}
                        sub={`Calculated at $${currentVolunteer?.hourlyValue}/hr`}
                        trend={null}
                    />
                    <StatCard
                        icon={<Building2 className="size-5 text-gray-700" />}
                        label="Orgs Assisted"
                        value={String(orgsAssisted)}
                        sub="Distinct Organizations"
                        trend={null}
                    />
                </div>

                {/* Chart + Partner Orgs */}
                <div
                    className="
                        mb-6 grid grid-cols-1 gap-6
                        lg:grid-cols-3
                    "
                >
                    {/* Contribution Trends */}
                    <div
                        className="
                            rounded-xl border bg-white p-6 shadow-sm
                            lg:col-span-2
                        "
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-800">Contribution Trends</h2>
                                <p className="text-xs text-gray-400">
                                    Monthly Breakdown of your Volunteer Hours
                                </p>
                            </div>
                            <select
                                value={chartRange}
                                onChange={(e) => setChartRange(e.target.value as ChartRange)}
                                className="
                                    cursor-pointer rounded-md border bg-white px-3 py-1 text-sm
                                    text-gray-500
                                "
                            >
                                {(Object.keys(RANGE_LABELS) as ChartRange[]).map((r) => (
                                    <option key={r} value={r}>
                                        {RANGE_LABELS[r]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div
                            className="flex items-end justify-between gap-2 px-2"
                            style={{ height: "200px" }}
                        >
                            {chartData.map((h, i) => {
                                const heightPct = Math.max(
                                    Math.round((h / maxHours) * 100),
                                    h > 0 ? 4 : 0,
                                );
                                const isLatest = i === chartData.length - 1;
                                return (
                                    <div
                                        key={`${chartLabels[i]}-${i}`}
                                        className="flex flex-1 flex-col items-center gap-1"
                                        style={{ height: "100%" }}
                                    >
                                        <div
                                            className="
                                                flex w-full flex-1 flex-col items-center justify-end
                                            "
                                        >
                                            {h > 0 && (
                                                <span
                                                    className="
                                                        mb-1 text-xs font-medium text-gray-500
                                                    "
                                                >
                                                    {h % 1 === 0 ? h : h.toFixed(1)}
                                                </span>
                                            )}
                                            <div
                                                className={`
                                                    w-full rounded-t-md
                                                    ${h > 0 ? (isLatest ? "bg-yellow-400" : "bg-yellow-200") : "bg-gray-100"}`}
                                                style={{
                                                    height: `${heightPct}%`,
                                                    minHeight: h > 0 ? "4px" : "2px",
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {chartLabels[i]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Partner Organizations */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-gray-800">Partner Organizations</h2>
                        {partnerOrgs.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400">
                                No organizations yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {partnerOrgs.map((org) => (
                                    <button
                                        key={org.id}
                                        className="
                                            flex w-full items-center gap-3 rounded-lg p-1 text-left
                                            hover:bg-gray-50
                                        "
                                        onClick={() =>
                                            router.push(`/volunteer/organizations/${org.id}`)
                                        }
                                    >
                                        <div
                                            className="
                                                flex size-10 shrink-0 items-center justify-center
                                                rounded-full bg-yellow-100 text-xs font-semibold
                                                text-yellow-700
                                            "
                                        >
                                            {org.orgName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="
                                                    truncate text-sm font-medium text-gray-800
                                                "
                                            >
                                                {org.orgName}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {org.totalHours}h
                                            </p>
                                            <p className="text-xs text-gray-400">TOTAL</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            className="mt-5 w-full rounded-lg border py-2"
                            onClick={() => setShowAllPartners(true)}
                        >
                            Expand All
                        </button>
                    </div>
                </div>

                {showAllPartners && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setShowAllPartners(false)}
                    >
                        <div
                            className="w-full max-w-2xl rounded-xl bg-white p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex justify-between">
                                <h2 className="text-lg font-semibold">All Partner Organizations</h2>
                                <button onClick={() => setShowAllPartners(false)}>✕</button>
                            </div>

                            <div className="max-h-[400px] space-y-2 overflow-y-auto">
                                {partnerOrgs.map((org) => (
                                    <button
                                        key={org.id}
                                        className="
                                            flex w-full items-center gap-3 rounded-sm p-2
                                            hover:bg-gray-50
                                        "
                                        onClick={() => {
                                            setShowAllPartners(false);
                                            router.push(`/volunteer/organizations/${org.id}`);
                                        }}
                                    >
                                        <div
                                            className="
                                                flex size-10 items-center justify-center
                                                rounded-full bg-yellow-100
                                            "
                                        >
                                            {org.orgName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <p className="flex-1 text-left">{org.orgName}</p>
                                        <p>{org.totalHours}h</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Your Opportunities */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="font-semibold text-gray-800">Your Opportunities</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr
                                    className="
                                        border-b text-left text-xs font-medium tracking-wide
                                        text-gray-400 uppercase
                                    "
                                >
                                    <th className="pr-4 pb-3">Charity</th>
                                    <th className="pr-4 pb-3">Category</th>
                                    <th className="pr-4 pb-3">Commitment</th>
                                    <th className="pr-4 pb-3">Hours</th>
                                    <th className="pr-4 pb-3">Status</th>
                                    <th className="pr-4 pb-3">Last Updated</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {opportunities.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-8 text-center text-sm text-gray-400"
                                        >
                                            No opportunities found.
                                        </td>
                                    </tr>
                                ) : (
                                    opportunities.map((opp) => (
                                        <tr key={opp.id} className="hover:bg-gray-50">
                                            <td className="py-3 pr-4 font-medium text-gray-800">
                                                {opp.organization?.id ? (
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/volunteer/organizations/${opp.organization!.id}`,
                                                            )
                                                        }
                                                        className="
                                                            text-left
                                                            hover:underline
                                                        "
                                                    >
                                                        {opp.organization.orgName}
                                                    </button>
                                                ) : (
                                                    (opp.organization?.orgName ?? "—")
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600">
                                                {opp.category}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600">
                                                {opp.commitmentLevel}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-800">
                                                {opp.hours}h
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`
                                                        rounded-full px-2.5 py-1 text-xs font-medium
                                                        ${STATUS_STYLES[opp.status]}
                                                    `}
                                                >
                                                    {opp.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-500">
                                                {new Date(opp.updatedAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    },
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    className="
                                                        rounded-md bg-yellow-400 px-3 py-1 text-xs
                                                        font-medium text-black
                                                        hover:bg-yellow-500
                                                    "
                                                    onClick={() =>
                                                        router.push(
                                                            `/volunteer/opportunities/${opp.id}`,
                                                        )
                                                    }
                                                >
                                                    View More
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <SubmitTicketModal
                open={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                onSubmitted={(ticket) =>
                    router.push(`/volunteer/messages?conversationId=${ticket.conversationId}`)
                }
            />
        </div>
    );
}

type StatCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    trend: string | null;
};

function StatCard({ icon, label, value, sub, trend }: StatCardProps) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="rounded-md bg-gray-100 p-2">{icon}</div>
                {trend && <span className="text-xs font-semibold text-green-500">{trend}</span>}
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-xs text-gray-400">{sub}</p>
        </div>
    );
}
