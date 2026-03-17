"use client";

import { Building2, X, CheckSquare, Square, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrgListViewModel, type TabKey } from "./orgListVm";
import { ModeratorNavbar } from "../moderator_navbar";

const TABS: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "All Organizations" },
    { key: "APPLIED", label: "Pending Approval" },
    { key: "VERIFIED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
];

export default function ModeratorOrganizationsPage() {
    const {
        loading,
        session,
        signOut,
        router,
        currentModerator,
        paginatedOrgs,
        filteredOrgs,
        error,
        activeTab,
        tabCounts,
        pendingSearch,
        setPendingSearch,
        pendingSort,
        setPendingSort,
        pendingPageSize,
        setPendingPageSize,
        PAGE_SIZE_OPTIONS,
        currentPage,
        totalPages,
        setCurrentPage,
        applyFilters,
        handleTabChange,
        selectedOrg,
        checks,
        allChecked,
        showRejectModal,
        rejectionReason,
        toast,
        openReviewModal,
        closeReviewModal,
        toggleCheck,
        setShowRejectModal,
        setRejectionReason,
        handleApprove,
        handleReject,
    } = useOrgListViewModel();

    if (loading || !session) {
        return <main className="p-6">Loading...</main>;
    }

    const startItem = filteredOrgs.length === 0 ? 0 : (currentPage - 1) * pendingPageSize + 1;
    const endItem = Math.min(currentPage * pendingPageSize, filteredOrgs.length);

    return (
        <div className="min-h-screen bg-gray-50">
            <ModeratorNavbar
                currentModerator={currentModerator}
                onSignOut={async () => {
                    await signOut();
                    router.push("/");
                }}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-sm text-gray-500">Review and Approve Organizations</p>
                </div>

                {error && (
                    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Search Organizations
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={pendingSearch}
                                    onChange={(e) => setPendingSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                    className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Sort By
                            </label>
                            <select
                                value={pendingSort}
                                onChange={(e) => setPendingSort(e.target.value as typeof pendingSort)}
                                className="rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="alphabetical">Alphabetical</option>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Show Per Page
                            </label>
                            <select
                                value={pendingPageSize}
                                onChange={(e) => setPendingPageSize(Number(e.target.value))}
                                className="rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="rounded-lg bg-yellow-400 px-5 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                <div className="mb-0 flex border-b bg-white">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key)}
                            className={`px-5 py-3 text-sm font-medium transition-colors ${
                                activeTab === key
                                    ? "border-b-2 border-yellow-400 text-yellow-500"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {label} ({tabCounts[key]})
                        </button>
                    ))}
                </div>

                <div className="rounded-b-xl border border-t-0 bg-white shadow-sm">
                    {paginatedOrgs.length === 0 ? (
                        <p className="py-16 text-center text-sm text-gray-400">No Organizations Found.</p>
                    ) : (
                        <ul className="divide-y">
                            {paginatedOrgs.map((org) => (
                                <li key={org.id} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                            <Building2 className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{org.orgName}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span>
                                                    📅 Submitted {new Date(org.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                                <span>
                                                    🕐 Last Updated {new Date(org.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {org.status === "APPLIED" && (
                                            <button
                                                className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                onClick={() => openReviewModal(org)}
                                            >
                                                Review Application
                                            </button>
                                        )}
                                        {org.status === "VERIFIED" && (
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                Approved
                                            </span>
                                        )}
                                        {org.status === "REJECTED" && (
                                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                Rejected
                                            </span>
                                        )}
                                        {org.status === "CREATED" && (
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                                                Not Applied
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <p>
                        {filteredOrgs.length === 0
                            ? "No organizations found"
                            : `Showing ${startItem}–${endItem} of ${filteredOrgs.length} organizations`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="rounded-md border p-1.5 disabled:opacity-40 hover:bg-gray-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 rounded-md text-sm font-medium ${
                                    page === currentPage
                                        ? "bg-yellow-400 text-black"
                                        : "border hover:bg-gray-100 text-gray-600"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="rounded-md border p-1.5 disabled:opacity-40 hover:bg-gray-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </main>

            {selectedOrg && !showRejectModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-yellow-50 p-2">
                                    <Building2 className="h-5 w-5 text-yellow-500" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Review Organization Application</h2>
                            </div>
                            <button onClick={closeReviewModal}>
                                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedOrg.orgName}</h3>
                            <p className="text-sm text-gray-400">
                                Submitted {new Date(selectedOrg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                {" · "}Last Updated {new Date(selectedOrg.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </div>

                        <div className="mb-6 rounded-xl border p-5">
                            <h4 className="mb-4 font-semibold text-gray-800">Organization Details</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Organization Name: </span>
                                    <span className="text-gray-600">{selectedOrg.orgName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleCheck("charityVerified")} className="text-yellow-500">
                                        {checks.charityVerified ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                    </button>
                                    <span className="text-gray-600">Charity number verified</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Website: </span>
                                    <span className="text-gray-600">{selectedOrg.website}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleCheck("websiteMatches")} className="text-yellow-500">
                                        {checks.websiteMatches ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                    </button>
                                    <span className="text-gray-600">Website matches name</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Field: </span>
                                    <span className="text-gray-600">{selectedOrg.causeCategory}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleCheck("documentsValid")} className="text-yellow-500">
                                        {checks.documentsValid ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                    </button>
                                    <span className="text-gray-600">Supporting documents valid</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Address: </span>
                                    <span className="text-gray-600">{selectedOrg.hqAdr}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleCheck("addressConfirmed")} className="text-yellow-500">
                                        {checks.addressConfirmed ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                    </button>
                                    <span className="text-gray-600">Address Confirmed</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 rounded-xl border p-5">
                            <h4 className="mb-4 font-semibold text-gray-800">Verification Documents</h4>
                            {selectedOrg.docId ? (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
                                        <Building2 className="h-8 w-8 text-yellow-400" />
                                        <p className="text-xs text-gray-600">Document</p>
                                        <a
                                            href={selectedOrg.docId}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-md bg-yellow-400 px-3 py-1 text-xs font-medium text-black hover:bg-yellow-500"
                                        >
                                            View
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No documents uploaded.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowRejectModal(true)}
                            >
                                Reject
                            </button>
                            <button
                                disabled={!allChecked}
                                className={`rounded-md px-6 py-2 text-sm font-medium text-black transition-colors ${
                                    allChecked
                                        ? "bg-yellow-400 hover:bg-yellow-500"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                                onClick={handleApprove}
                            >
                                Approve Organization
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedOrg && showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-yellow-50 p-2">
                                    <Building2 className="h-5 w-5 text-yellow-500" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Reject Organization</h2>
                            </div>
                            <button onClick={() => setShowRejectModal(false)}>
                                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Target Organization</p>
                            <p className="font-semibold text-gray-800">Rejecting: {selectedOrg.orgName}</p>
                            <p className="mt-1 text-sm text-gray-500">
                                This action will notify the organization that their application has been declined.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Reason For Rejection
                            </label>
                            <textarea
                                className="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                rows={5}
                                placeholder="Describe reasons for rejecting organization..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Please be specific to help the organization improve their application.
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!rejectionReason.trim()}
                                className={`rounded-md px-6 py-2 text-sm font-medium text-black transition-colors ${
                                    rejectionReason.trim()
                                        ? "bg-yellow-400 hover:bg-yellow-500"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                                onClick={handleReject}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.visible && (
                <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-xl border bg-white px-5 py-3 shadow-lg">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                        <span className="text-xs text-green-600">✓</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Success</p>
                        <p className="text-xs text-gray-500">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}