"use client";

import { useAuth } from "@/providers/auth-provider";
import { ModeratorService } from "@/services/ModeratorService";
import type {
    CurrentModerator,
    ModeratorTicketList,
    ModeratorTicketStatus,
} from "@volunteerly/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type TicketTabKey = ModeratorTicketStatus;
export type TicketSortKey = "ascending" | "descending";

export const TICKET_TABS: { key: TicketTabKey; label: string }[] = [
    { key: "OPEN", label: "Open" },
    { key: "CLOSED", label: "Closed" },
];

const PAGE_SIZE_OPTIONS = [3, 5, 10] as const;

export function useTicketListViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const requestedTickedId = searchParams.get("ticketId");

    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(
        undefined,
    );
    const [tickets, setTickets] = useState<ModeratorTicketList>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);

    function openTicketDetail(ticketId: string) {
        setSelectedTicketId(ticketId);
        setIsTicketDetailOpen(true);
    }

    function closeTicketDetail() {
        setIsTicketDetailOpen(false);
        setSelectedTicketId(null);
        router.replace(pathName);
    }

    const [activeTab, setActiveTab] = useState<TicketTabKey>("OPEN");
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingSearch, setPendingSearch] = useState("");
    const [sortBy, setSortBy] = useState<TicketSortKey>("ascending");
    const [pendingSort, setPendingSort] = useState<TicketSortKey>("ascending");
    const [pageSize, setPageSize] = useState<number>(3);
    const [pendingPageSize, setPendingPageSize] = useState<number>(3);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function load() {
            if (!session?.access_token) return;

            try {
                const modResult = await ModeratorService.getCurrentModerator();
                if (modResult.success) setCurrentModerator(modResult.data);

                const ticketResults = await ModeratorService.getModeratorTickets();
                setTickets(ticketResults);
            } catch (err) {
                console.error(err);
                setError("Failed to load tickets.");
            } finally {
                setLoadingData(false);
            }
        }

        load();
    }, [session, router]);

    useEffect(() => {
        if (!requestedTickedId || selectedTicketId === requestedTickedId) return;

        setSelectedTicketId(requestedTickedId);
        setIsTicketDetailOpen(true);
    }, [requestedTickedId, selectedTicketId]);

    const tabCounts = useMemo(
        () => ({
            OPEN: tickets.filter((ticket) => ticket.status === "OPEN").length,
            CLOSED: tickets.filter((ticket) => ticket.status === "CLOSED").length,
        }),
        [tickets],
    );

    const filteredTickets = useMemo(() => {
        let rows = tickets;

        rows = rows.filter((ticket) => ticket.status === activeTab);

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();

            rows = rows.filter((ticket) => {
                const shortId = ticket.id.slice(0, 8).toLowerCase();
                return (
                    shortId.includes(q) ||
                    ticket.title.toLowerCase().includes(q) ||
                    ticket.description.toLowerCase().includes(q)
                );
            });
        }

        rows = [...rows].sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();

            return sortBy === "ascending" ? aTime - bTime : bTime - aTime;
        });

        return rows;
    }, [tickets, activeTab, searchQuery, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));

    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const startItem = filteredTickets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredTickets.length);

    function applyFilters() {
        setSearchQuery(pendingSearch);
        setSortBy(pendingSort);
        setPageSize(pendingPageSize);
        setCurrentPage(1);
    }

    function handleTabChange(tab: TicketTabKey) {
        setActiveTab(tab);
        setCurrentPage(1);
    }

    async function refreshTickets() {
        const ticketResults = await ModeratorService.getModeratorTickets();
        setTickets(ticketResults);
    }

    async function claimTicket(ticketId: string) {
        try {
            setError(null);
            await ModeratorService.claimModeratorTicket(ticketId);
            await refreshTickets();
        } catch (err) {
            console.error(err);
            setError("Failed to claim ticket.");
        }
    }

    async function closeTicket(ticketId: string) {
        try {
            setError(null);
            await ModeratorService.closeModeratorTicket(ticketId);
            await refreshTickets();
        } catch (err) {
            console.error(err);
            setError("Failed to close ticket.");
        }
    }

    return {
        auth: {
            loading: loading || loadingData,
            session,
            signOut,
            router,
            currentModerator,
        },
        page: {
            title: "Tickets",
            subtitle: "Manage and close open tickets",
            activeTab,
            tabCounts,
            error,
            selectedTicketId,
            isTicketDetailOpen,
            openTicketDetail,
            closeTicketDetail,
            claimTicket,
            closeTicket,
            refreshTickets,
        },
        filters: {
            pendingSearch,
            setPendingSearch,
            pendingSort,
            setPendingSort,
            pendingPageSize,
            setPendingPageSize,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            applyFilters,
            handleTabChange,
        },
        data: {
            rows: paginatedTickets,
            isEmpty: paginatedTickets.length === 0,
        },
        pagination: {
            currentPage,
            totalPages,
            setCurrentPage,
            startItem,
            endItem,
            totalItems: filteredTickets.length,
        },
    };
}
