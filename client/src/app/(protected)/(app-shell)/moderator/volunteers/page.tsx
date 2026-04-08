"use client";

import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { useVolunteerListViewModel, VOLUNTEER_TABS, VolunteerSortKey } from "./volunteerListVm";
import { ModeratorFilterBar } from "@/components/moderator/moderator-filter-bar";
import { ModeratorListContainer } from "@/components/moderator/moderator-list-container";
import { ModeratorPageHeader } from "@/components/moderator/moderator-page-header";
import { ModeratorPagination } from "@/components/moderator/moderator-pagination";
import { ModeratorTabs } from "@/components/moderator/moderator-tabs";
import { useState } from "react";
import {
    VolunteerDetailModal,
    VolunteerModalMode,
} from "@/app/(protected)/(app-shell)/moderator/volunteers/volunteer-detail-modal";

function getSeverity(pastFlagsCount: number) {
    return pastFlagsCount >= 3 ? "HIGH" : "MEDIUM";
}

export default function ModeratorVolunteersPage() {
    const { auth, page, filters, data, pagination } = useVolunteerListViewModel();

    const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
    const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
    const [volunteerModalMode, setVolunteerModalMode] = useState<VolunteerModalMode>("profile");

    function openVolunteerModal(volunteerId: string, mode: VolunteerModalMode) {
        setSelectedVolunteerId(volunteerId);
        setVolunteerModalMode(mode);
        setIsVolunteerModalOpen(true);
    }

    function closeVolunteerModal() {
        setIsVolunteerModalOpen(false);
        setSelectedVolunteerId(null);
        setVolunteerModalMode("profile");
    }

    if (auth.loading && !auth.session) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <ModeratorPageHeader title={page.title} subtitle={page.subtitle} />

                {page.error && (
                    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {page.error}
                    </p>
                )}

                <ModeratorFilterBar
                    searchLabel="Search Volunteers"
                    searchPlaceholder="Search by name..."
                    searchValue={filters.pendingSearch}
                    onSearchChange={filters.setPendingSearch}
                    onSearchEnter={filters.applyFilters}
                    sortLabel="Sort By"
                    sortValue={filters.pendingSort}
                    onSortChange={(value) => filters.setPendingSort(value as VolunteerSortKey)}
                    sortOptions={[
                        { value: "alphabetical", label: "Alphabetical" },
                        { value: "highest-flags", label: "Highest Flags" },
                        { value: "highest-rating", label: "Highest Rating" },
                    ]}
                    pageSizeValue={filters.pendingPageSize}
                    onPageSizeChange={filters.setPendingPageSize}
                    pageSizeOptions={filters.pageSizeOptions}
                    onApply={filters.applyFilters}
                />

                <ModeratorTabs
                    tabs={VOLUNTEER_TABS}
                    activeTab={page.activeTab}
                    counts={page.tabCounts}
                    onChange={filters.handleTabChange}
                />

                <ModeratorListContainer isEmpty={data.isEmpty} emptyMessage="No Volunteers Found." className="p-6">
                    <div className="space-y-5">
                        {data.rows.map((volunteer) => {
                            const showFlaggedActions = page.activeTab === "FLAGGED" && volunteer.state === "FLAGGED";

                            const severity = getSeverity(volunteer.pastFlagsCount);

                            return (
                                <div
                                    key={volunteer.id}
                                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                                >
                                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                                                {volunteer.avatarUrl ? (
                                                    <Image
                                                        src={volunteer.avatarUrl}
                                                        alt={`${volunteer.firstName} ${volunteer.lastName}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-500">
                                                        {volunteer.firstName[0]} {volunteer.lastName[0]}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {volunteer.firstName} {volunteer.lastName}
                                                </p>

                                                <p className="text-lg text-gray-500">{volunteer.location}</p>

                                                {volunteer.flaggedByDisplayName ? (
                                                    <p className="mt-3 text-sm text-gray-700">
                                                        <span className="font-semibold">Flagged By: </span>
                                                        <span className="text-gray-500">
                                                            {volunteer.flaggedByDisplayName}
                                                        </span>
                                                    </p>
                                                ) : null}

                                                {volunteer.latestFlagReason ? (
                                                    <p className="mt-1 text-sm text-gray-700">
                                                        {volunteer.latestFlagReason}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {showFlaggedActions ? (
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${
                                                            severity === "HIGH" ? "bg-destructive" : "bg-warning"
                                                        }`}
                                                    >
                                                        {severity}
                                                    </span>

                                                    <button
                                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-xl font-bold text-foreground hover:opacity-90"
                                                        onClick={() => openVolunteerModal(volunteer.id, "profile")}
                                                    >
                                                        View Profile
                                                        <ExternalLink className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-foreground hover:opacity-90"
                                                        onClick={() =>
                                                            openVolunteerModal(volunteer.id, "investigation")
                                                        }
                                                    >
                                                        View Investigation
                                                    </button>

                                                    <button
                                                        onClick={() => openVolunteerModal(volunteer.id, "warning")}
                                                        className="rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                                                    >
                                                        Issue Warning
                                                    </button>

                                                    <button
                                                        onClick={() => openVolunteerModal(volunteer.id, "suspend")}
                                                        className="rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                                                    >
                                                        Suspend
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openVolunteerModal(volunteer.id, "profile")}
                                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-xl font-bold text-foreground hover:opacity-90"
                                            >
                                                View Profile
                                                <ExternalLink className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 border-t px-6 py-3 text-sm text-gray-600">
                                        <span>Past Flags: {volunteer.pastFlagsCount}</span>
                                        <span>&middot;</span>
                                        <span>Completed Opportunities: {volunteer.completedOpportunities}</span>
                                        <span>&middot;</span>
                                        <span>Average Rating: {volunteer.averageRating}</span>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ModeratorListContainer>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <p>
                        Showing <b>{pagination.startItem}</b>-<b>{pagination.endItem}</b> of{" "}
                        <b>{pagination.totalItems}</b> accounts
                    </p>
                    <ModeratorPagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.setCurrentPage}
                    />
                </div>
            </main>

            <VolunteerDetailModal
                volunteerId={selectedVolunteerId}
                open={isVolunteerModalOpen}
                mode={volunteerModalMode}
                onClose={closeVolunteerModal}
                onUpdated={page.refreshVolunteers}
            />
        </div>
    );
}
