"use client";

import { MessageSquareText } from "lucide-react";
import { TICKET_TABS, TicketSortKey, useTicketListViewModel } from "./ticketListVm";
import type { ModeratorTicket } from "@volunteerly/shared";
import { ModeratorFilterBar } from "@/components/moderator/moderator-filter-bar";
import { ModeratorListContainer } from "@/components/moderator/moderator-list-container";
import { ModeratorPageHeader } from "@/components/moderator/moderator-page-header";
import { ModeratorPagination } from "@/components/moderator/moderator-pagination";
import { ModeratorTabs } from "@/components/moderator/moderator-tabs";
import { TicketDetailModal } from "@/app/(protected)/(app-shell)/moderator/tickets/ticket-detail/ticketDetailModal";

function formatCategory(category: ModeratorTicket["category"]) {
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

function getUrgencyClasses(urgency: ModeratorTicket["urgencyRating"]) {
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

function getTimeOpen(createdAt: string) {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - created);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} Day${days === 1 ? "" : "s"}`;
    if (hours > 0) return `${hours} Hour${hours === 1 ? "" : "s"}`;
    return "Less than 1 Hour";
}

export default function ModeratorTicketsPage() {
    const { auth, page, filters, data, pagination } = useTicketListViewModel();

    if (auth.loading || !auth.session) {
        return <main className="p-6">Loading...</main>;
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
                <ModeratorPageHeader title={page.title} subtitle={page.subtitle} />

                {page.error && (
                    <p
                        className="
                            mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm
                            text-red-600
                        "
                    >
                        {page.error}
                    </p>
                )}

                <ModeratorFilterBar
                    searchLabel="Search Tickets"
                    searchPlaceholder="Search by ticket ID..."
                    searchValue={filters.pendingSearch}
                    onSearchChange={filters.setPendingSearch}
                    onSearchEnter={filters.applyFilters}
                    sortLabel="Sort By"
                    sortValue={filters.pendingSort}
                    onSortChange={(value) => filters.setPendingSort(value as TicketSortKey)}
                    sortOptions={[
                        { value: "ascending", label: "Ascending" },
                        { value: "descending", label: "Descending" },
                    ]}
                    pageSizeValue={filters.pendingPageSize}
                    onPageSizeChange={filters.setPendingPageSize}
                    pageSizeOptions={filters.pageSizeOptions}
                    onApply={filters.applyFilters}
                />

                <ModeratorTabs
                    tabs={TICKET_TABS}
                    activeTab={page.activeTab}
                    counts={page.tabCounts}
                    onChange={filters.handleTabChange}
                />

                <ModeratorListContainer
                    isEmpty={data.isEmpty}
                    emptyMessage="No Tickets Found."
                    className="p-6"
                >
                    <div className="space-y-5">
                        {data.rows.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="
                                    overflow-hidden rounded-2xl border border-border bg-card
                                    shadow-sm
                                "
                            >
                                <div
                                    className="
                                        flex flex-col gap-4 border-b px-6 py-4
                                        lg:flex-row lg:items-center lg:justify-between
                                    "
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-2xl font-bold text-foreground">
                                            Ticket #{ticket.id.slice(-8).toUpperCase()}
                                        </h3>

                                        <span
                                            className="
                                                rounded-full bg-blue-100 px-3 py-1 text-xs font-bold
                                                tracking-wide text-blue-700 uppercase
                                            "
                                        >
                                            {formatCategory(ticket.category)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span
                                            className={`
                                                rounded-full px-5 py-1.5 text-xs font-bold
                                                tracking-wide uppercase
                                                ${getUrgencyClasses(ticket.urgencyRating)}
                                            `}
                                        >
                                            {ticket.urgencyRating}
                                        </span>

                                        <span className="text-base font-medium text-foreground">
                                            {ticket.status === "OPEN" ? "Open" : "Closed"}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="
                                        flex flex-col gap-6 px-6 py-5
                                        lg:flex-row lg:items-center lg:justify-between
                                    "
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="
                                                flex size-20 items-center justify-center rounded-2xl
                                                bg-secondary
                                            "
                                        >
                                            <MessageSquareText className="size-10 text-muted-foreground" />
                                        </div>

                                        <div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {ticket.title}
                                            </p>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    Time Open:
                                                </span>{" "}
                                                {getTimeOpen(ticket.createdAt)}
                                            </p>

                                            <p
                                                className="
                                                    mt-2 max-w-3xl text-base text-muted-foreground
                                                "
                                            >
                                                {ticket.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            className="
                                                rounded-xl bg-primary px-6 py-3 text-base
                                                font-semibold text-foreground
                                                hover:opacity-90
                                            "
                                            onClick={() => {
                                                page.openTicketDetail(ticket.id);
                                            }}
                                        >
                                            View Ticket
                                        </button>

                                        {ticket.status === "OPEN" && (
                                            <button
                                                type="button"
                                                className="
                                                    rounded-xl border border-border bg-card px-6
                                                    py-3 text-base font-semibold text-foreground
                                                    hover:bg-secondary
                                                "
                                                onClick={() =>
                                                    ticket.targetId === auth.currentModerator?.id
                                                        ? void page.closeTicket(ticket.id)
                                                        : void page.claimTicket(ticket.id)
                                                }
                                            >
                                                {ticket.targetId === auth.currentModerator?.id
                                                    ? "Close Ticket"
                                                    : "Claim Ticket"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ModeratorListContainer>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <p>
                        Showing <b>{pagination.startItem}</b>-<b>{pagination.endItem}</b> of{" "}
                        <b>{pagination.totalItems}</b> tickets
                    </p>

                    <ModeratorPagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.setCurrentPage}
                    />
                </div>
            </main>

            <TicketDetailModal
                ticketId={page.selectedTicketId}
                open={page.isTicketDetailOpen}
                onClose={page.closeTicketDetail}
                currentUserId={auth.currentModerator?.id ?? ""}
                onTicketUpdated={page.refreshTickets}
            />
        </div>
    );
}
