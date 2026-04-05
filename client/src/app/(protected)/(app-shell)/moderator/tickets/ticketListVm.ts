"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import type {
  CurrentModerator,
  ModeratorTicket,
  ModeratorTicketList,
  ModeratorTicketStatus,
} from "@volunteerly/shared";

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

  const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(undefined);
  const [tickets, setTickets] = useState<ModeratorTicketList>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TicketTabKey>("OPEN");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [sortBy, setSortBy] = useState<TicketSortKey>("ascending");
  const [pendingSort, setPendingSort] = useState<TicketSortKey>("ascending");
  const [pageSize, setPageSize] = useState<number>(3);
  const [pendingPageSize, setPendingPageSize] = useState<number>(3);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  useEffect(() => {
    async function load() {
      if (!session?.access_token) return;

      try {
        const userResult = await UserService.getCurrentUser();
        if (!userResult.success || userResult.data.role !== "MODERATOR") {
          router.replace("/bootstrap");
          return;
        }

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

  const tabCounts = useMemo(
    () => ({
      OPEN: tickets.filter((ticket) => ticket.status === "OPEN").length,
      CLOSED: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    }),
    [tickets]
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
    currentPage * pageSize
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