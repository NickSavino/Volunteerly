"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Star, DollarSign, Building2, Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";
import avtImg from "@/assets/avatarImg.png";
import { useVltDashboardViewModel } from "./vltDashboardVm";

const NAV_LINKS = [
    { label: "Dashboard",     href: "/volunteer" },
    { label: "Activity Log",  href: "/volunteer/activity" },
    { label: "Certificates",  href: "/volunteer/certificates" },
    { label: "Organizations", href: "/volunteer/organizations" },
    { label: "Settings",      href: "/volunteer/settings" },
] as const;

const STATUS_STYLES: Record<string, string> = {
    OPEN:      "bg-green-50 text-green-700",
    FILLED:    "bg-blue-50 text-blue-700",
    CLOSED:    "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-50 text-red-600",
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
        monthlyHours,
        months,
        router,
    } = useVltDashboardViewModel();

    const pathname = usePathname();

    const fullName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";

    if (loading || !session) {
        return <main className="p-6">Loading...</main>;
    }

    const maxHours = Math.max(...monthlyHours);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* navbar*/}
            <header className="w-full border-b bg-white px-6 py-3">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link href="/volunteer" className="flex-shrink-0">
                        <Image src={logo} alt="Volunteerly" width={140} height={40} priority />
                    </Link>

                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="flex gap-6">
                            {NAV_LINKS.map(({ label, href }) => {
                                const isActive = pathname === href;
                                return (
                                    <NavigationMenuItem key={href}>
                                        <Link
                                            href={href}
                                            className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                                                isActive
                                                    ? "border-b-2 border-yellow-400 text-yellow-500"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    </NavigationMenuItem>
                                );
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-full border bg-gray-50 px-3 py-1.5 text-sm text-gray-400 sm:flex">
                            <Search className="h-4 w-4" />
                            <span>Search activities...</span>
                        </div>

                        <button
                            onClick={() => router.push("/volunteer/activity/new")}
                            className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
                        >
                            <Plus className="h-4 w-4" />
                            Record Hours
                        </button>

                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="p-0">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={avtImg.src} />
                                            <AvatarFallback>
                                                {currentVolunteer?.firstName?.[0] ?? "V"}
                                                {currentVolunteer?.lastName?.[0] ?? ""}
                                            </AvatarFallback>
                                        </Avatar>
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="w-40 p-1">
                                            <p className="px-2 py-1 text-sm font-medium text-gray-800">{fullName}</p>
                                            <p className="px-2 pb-2 text-xs text-gray-400">Volunteer</p>
                                            <hr className="mb-1" />
                                            <button
                                                className="w-full rounded px-2 py-1 text-left text-sm text-gray-600 hover:bg-gray-100"
                                                onClick={handleSignOut}
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>
            </header>

            {/* main*/}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {firstName}!
                    </h1>
                    <p className="text-sm text-gray-500">
                        You have made a significant impact this month.
                    </p>
                </div>

                {error && (
                    <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/* volunteer stat cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        icon={<Clock className="h-5 w-5 text-gray-700" />}
                        trend="+12%"
                        trendPositive
                        label="Total Hours"
                        value={totalHours.toString()}
                        sub="v.s. 112 last month"
                    />
                    <StatCard
                        icon={<Star className="h-5 w-5 text-gray-700" />}
                        trend="+5.2%"
                        trendPositive
                        label="Impact Score"
                        value="2,450"
                        sub="Top 5% in your city"
                    />
                    <StatCard
                        icon={<DollarSign className="h-5 w-5 text-gray-700" />}
                        trend="+12%"
                        trendPositive
                        label="Economic Value"
                        value={`$${Number(economicValue).toLocaleString()}`}
                        sub="Calculated at $31.80/hr"
                    />
                    <StatCard
                        icon={<Building2 className="h-5 w-5 text-gray-700" />}
                        trend="Static"
                        trendPositive={null}
                        label="Orgs Assisted"
                        value={String(partnerOrgs.length)}
                        sub={`${partnerOrgs.length} total`}
                    />
                </div>

                {/* bar chart */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* contribution trends */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-800">Contribution Trends</h2>
                                <p className="text-xs text-gray-400">Monthly breakdown of volunteer hours</p>
                            </div>
                            <span className="rounded-md border px-3 py-1 text-sm text-gray-500">
                                Last 6 Months ▾
                            </span>
                        </div>
                        <div className="flex items-end justify-between gap-2 px-2" style={{ height: "180px" }}>
                            {monthlyHours.map((h, i) => {
                                const heightPct = Math.round((h / maxHours) * 100);
                                const isLatest = i === monthlyHours.length - 1;
                                return (
                                    <div key={months[i]} className="flex flex-1 flex-col items-center gap-1">
                                        <div
                                            className={`w-full rounded-t-md ${isLatest ? "bg-yellow-400" : "bg-yellow-200"}`}
                                            style={{ height: `${heightPct}%` }}
                                        />
                                        <span className="text-xs text-gray-400">{months[i]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* partner orgs */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-gray-800">Partner Organizations</h2>
                        {partnerOrgs.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400">No organizations yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {partnerOrgs.map((org) => (
                                    <div key={org.id} className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-xs font-semibold text-yellow-700">
                                            {org.orgName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-800">{org.orgName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            className="mt-5 w-full rounded-lg border py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            onClick={() => router.push("/volunteer/organizations")}
                        >
                            View All {partnerOrgs.length} Partners
                        </button>
                    </div>
                </div>

                {/* recent activity */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="font-semibold text-gray-800">Your Opportunities</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                    <th className="pb-3 pr-4">Posted</th>
                                    <th className="pb-3 pr-4">Name</th>
                                    <th className="pb-3 pr-4">Category</th>
                                    <th className="pb-3 pr-4">Commitment</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {opportunities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                                            No opportunities found.
                                        </td>
                                    </tr>
                                ) : (
                                    opportunities.map((opp) => (
                                        <tr key={opp.id} className="hover:bg-gray-50">
                                            <td className="py-3 pr-4 text-gray-500">
                                                {new Date(opp.postedDate).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric"
                                                })}
                                            </td>
                                            <td className="py-3 pr-4 font-medium text-gray-800">{opp.name}</td>
                                            <td className="py-3 pr-4 text-gray-600">{opp.category}</td>
                                            <td className="py-3 pr-4 text-gray-600">{opp.commitmentLevel}</td>
                                            <td className="py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[opp.status]}`}>
                                                    {opp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}

type StatCardProps = {
    icon: React.ReactNode;
    trend: string;
    trendPositive: boolean | null;
    label: string;
    value: string;
    sub: string;
};

function StatCard({ icon, trend, trendPositive, label, value, sub }: StatCardProps) {
    const trendClass =
        trendPositive === true
            ? "text-green-500"
            : trendPositive === false
            ? "text-red-500"
            : "text-gray-400";

    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="rounded-md bg-gray-100 p-2">{icon}</div>
                <span className={`text-xs font-semibold ${trendClass}`}>{trend}</span>
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-xs text-gray-400">{sub}</p>
        </div>
    );
}