/**
 * page.tsx
 * Renders the moderator organization review page.
 */

"use client";

import { AppModal } from "@/components/common/app-modal";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { ModeratorFilterBar } from "@/components/moderator/moderator-filter-bar";
import { ModeratorListContainer } from "@/components/moderator/moderator-list-container";
import { ModeratorPageHeader } from "@/components/moderator/moderator-page-header";
import { ModeratorPagination } from "@/components/moderator/moderator-pagination";
import { ModeratorTabs } from "@/components/moderator/moderator-tabs";
import { Button } from "@/components/ui/button";
import { Building2, BuildingIcon, CheckSquare, Square } from "lucide-react";
import { SortKey, useOrgListViewModel, type TabKey } from "./orgListVm";

const TABS: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "All Organizations" },
    { key: "APPLIED", label: "Pending Approval" },
    { key: "VERIFIED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
];

export default function ModeratorOrganizationsPage() {
    const { auth, page, filters, data, pagination, review } = useOrgListViewModel();

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
                    searchLabel="Search Organizations"
                    searchPlaceholder="Search by name..."
                    searchValue={filters.pendingSearch}
                    onSearchChange={filters.setPendingSearch}
                    onSearchEnter={filters.applyFilters}
                    sortLabel="Sort By"
                    sortValue={filters.pendingSort}
                    onSortChange={(value) => filters.setPendingSort(value as SortKey)}
                    sortOptions={[
                        { value: "alphabetical", label: "Alphabetical" },
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                    ]}
                    pageSizeValue={filters.pendingPageSize}
                    onPageSizeChange={filters.setPendingPageSize}
                    pageSizeOptions={filters.pageSizeOptions}
                    onApply={filters.applyFilters}
                />

                <ModeratorTabs
                    tabs={TABS}
                    activeTab={page.activeTab}
                    counts={page.tabCounts}
                    onChange={filters.handleTabChange}
                />

                <ModeratorListContainer
                    isEmpty={data.isEmpty}
                    emptyMessage="No Organizations Found."
                    className="p-6"
                >
                    <div className="space-y-5">
                        {data.rows.map((org) => (
                            <div
                                key={org.id}
                                className="
                                    overflow-hidden rounded-2xl border border-border bg-card
                                    shadow-sm
                                "
                            >
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="
                                                flex size-10 items-center justify-center
                                                rounded-full bg-secondary
                                            "
                                        >
                                            <Building2 className="size-5 text-muted-foreground" />
                                        </div>

                                        <div>
                                            <p className="font-medium text-foreground">
                                                {org.orgName}
                                            </p>
                                            <div
                                                className="
                                                    flex items-center gap-3 text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                <span>
                                                    Submitted{" "}
                                                    {new Date(org.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                                <span>
                                                    Last Updated{" "}
                                                    {new Date(org.updatedAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {org.status === "APPLIED" && (
                                            <button
                                                className="
                                                    rounded-md border border-border bg-card px-4
                                                    py-1.5 text-sm font-medium text-foreground
                                                    hover:bg-secondary
                                                "
                                                onClick={() => review.openReviewModal(org)}
                                            >
                                                Review Application
                                            </button>
                                        )}

                                        {org.status === "VERIFIED" && (
                                            <span
                                                className="
                                                    rounded-full bg-green-100 px-3 py-1 text-xs
                                                    font-medium text-green-700
                                                "
                                            >
                                                Approved
                                            </span>
                                        )}

                                        {org.status === "REJECTED" && (
                                            <span
                                                className="
                                                    rounded-full bg-red-100 px-3 py-1 text-xs
                                                    font-medium text-red-700
                                                "
                                            >
                                                Rejected
                                            </span>
                                        )}

                                        {org.status === "CREATED" && (
                                            <span
                                                className="
                                                    rounded-full bg-secondary px-3 py-1 text-xs
                                                    font-medium text-muted-foreground
                                                "
                                            >
                                                Not Applied
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ModeratorListContainer>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <p>
                        {pagination.totalItems === 0
                            ? "No organizations found"
                            : `Showing ${pagination.startItem}–${pagination.endItem} of ${pagination.totalItems} organizations`}
                    </p>

                    <ModeratorPagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.setCurrentPage}
                    />
                </div>
            </main>

            <AppModal
                open={!!review.selectedOrg}
                onClose={review.closeReviewModal}
                title="Review Organization Application"
                icon={<BuildingIcon className="size-5 text-primary" />}
                maxWidthClassName="sm:max-w-lg"
                footer={
                    <>
                        <button
                            className="
                                rounded-md border bg-card px-5 py-2 text-sm font-medium
                                text-foreground
                                hover:bg-secondary
                            "
                            onClick={() => review.setShowRejectModal(true)}
                        >
                            Reject
                        </button>

                        <button
                            disabled={!review.allChecked}
                            className={`
                                rounded-md px-6 py-2 text-sm font-medium text-foreground
                                transition-colors
                                ${
                                    review.allChecked
                                        ? `
                                            bg-primary
                                            hover:opacity-90
                                        `
                                        : "cursor-not-allowed bg-secondary text-muted-foreground"
                                }
                            `}
                            onClick={review.requestApprove}
                        >
                            Approve Organization
                        </button>
                    </>
                }
            >
                {review.selectedOrg ? (
                    <>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground">
                                {review.selectedOrg.orgName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Submitted{" "}
                                {new Date(review.selectedOrg.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                                {" . "}Last Updated{" "}
                                {new Date(review.selectedOrg.updatedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </p>
                        </div>

                        <div className="mb-6 rounded-xl border p-5">
                            <h4 className="mb-4 font-semibold text-foreground">
                                Organization Details
                            </h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-foreground">
                                        Organization Name:
                                    </span>
                                    <span className="text-muted-foreground">
                                        {review.selectedOrg.orgName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => review.toggleCheck("charityVerified")}
                                        className="text-primary"
                                    >
                                        {review.checks.charityVerified ? (
                                            <CheckSquare className="size-4" />
                                        ) : (
                                            <Square className="size-4" />
                                        )}
                                    </button>
                                    <span className="text-muted-foreground">
                                        Charity number verified
                                    </span>
                                </div>

                                <div>
                                    <span className="font-medium text-foreground">Website: </span>
                                    <span className="text-muted-foreground">
                                        {review.selectedOrg.website}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => review.toggleCheck("websiteMatches")}
                                        className="text-primary"
                                    >
                                        {review.checks.websiteMatches ? (
                                            <CheckSquare className="size-4" />
                                        ) : (
                                            <Square className="size-4" />
                                        )}
                                    </button>
                                    <span className="text-muted-foreground">
                                        Website matches name
                                    </span>
                                </div>

                                <div>
                                    <span className="font-medium text-foreground">Field: </span>
                                    <span className="text-muted-foreground">
                                        {review.selectedOrg.causeCategory}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => review.toggleCheck("documentsValid")}
                                        className="text-primary"
                                    >
                                        {review.checks.documentsValid ? (
                                            <CheckSquare className="size-4" />
                                        ) : (
                                            <Square className="size-4" />
                                        )}
                                    </button>
                                    <span className="text-muted-foreground">
                                        Supporting documents valid
                                    </span>
                                </div>

                                <div>
                                    <span className="font-medium text-foreground">Address: </span>
                                    <span className="text-muted-foreground">
                                        {review.selectedOrg.hqAdr}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => review.toggleCheck("addressConfirmed")}
                                        className="text-primary"
                                    >
                                        {review.checks.addressConfirmed ? (
                                            <CheckSquare className="size-4" />
                                        ) : (
                                            <Square className="size-4" />
                                        )}
                                    </button>
                                    <span className="text-muted-foreground">Address confirmed</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border p-5">
                            <h4 className="mb-4 font-semibold text-foreground">
                                Verification Documents
                            </h4>

                            {review.selectedOrg.docId ? (
                                <div className="flex gap-4">
                                    <div
                                        className="
                                            flex flex-col items-center gap-2 rounded-xl border p-4
                                        "
                                    >
                                        <Building2 className="size-8 text-primary" />
                                        <p className="text-xs text-muted-foreground">Document</p>
                                        <Button
                                            type="button"
                                            onClick={() => void review.handleViewDocument()}
                                            className="
                                                rounded-md bg-primary px-3 py-1 text-xs font-medium
                                                text-foreground
                                                hover:opacity-90
                                            "
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No documents uploaded.
                                </p>
                            )}
                        </div>
                    </>
                ) : null}
            </AppModal>

            <AppModal
                open={!!review.selectedOrg && review.showRejectModal}
                onClose={() => review.setShowRejectModal(false)}
                title="Reject Organization"
                icon={<BuildingIcon className="size-5 text-primary" />}
                maxWidthClassName="sm:max-w-lg"
                footer={
                    <>
                        <button
                            className="
                                rounded-md border bg-card px-5 py-2 text-sm font-medium
                                text-foreground
                                hover:bg-secondary
                            "
                            onClick={() => review.setShowRejectModal(false)}
                        >
                            Cancel
                        </button>

                        <button
                            disabled={!review.rejectionReason.trim()}
                            className={`
                                rounded-md px-6 py-2 text-sm font-medium text-foreground
                                transition-colors
                                ${
                                    review.rejectionReason.trim()
                                        ? `
                                            bg-primary
                                            hover:opacity-90
                                        `
                                        : "cursor-not-allowed bg-secondary text-muted-foreground"
                                }
                            `}
                            onClick={review.handleReject}
                        >
                            Confirm Rejection
                        </button>
                    </>
                }
            >
                {review.selectedOrg ? (
                    <>
                        <div className="mb-4">
                            <p
                                className="
                                    text-xs font-semibold tracking-wide text-muted-foreground
                                    uppercase
                                "
                            >
                                Target Organization
                            </p>
                            <p className="font-semibold text-foreground">
                                Rejecting: {review.selectedOrg.orgName}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                This action will notify the organization that their application has
                                been declined.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-foreground">
                                Reason For Rejection
                            </label>
                            <textarea
                                className="
                                    w-full rounded-lg border border-input bg-background px-3 py-2
                                    text-sm text-foreground
                                    focus:ring-2 focus:outline-none
                                "
                                rows={5}
                                placeholder="Describe reasons for rejecting organization..."
                                value={review.rejectionReason}
                                onChange={(e) => review.setRejectionReason(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Please be specific to help the organization improve their
                                application.
                            </p>
                        </div>
                    </>
                ) : null}
            </AppModal>

            <ConfirmActionDialog
                open={review.showApproveConfirm}
                onOpenChange={review.setShowApproveConfirm}
                title="Approve Organization"
                message="Are you sure you want to approve this organization?"
                additionalInfo={
                    review.selectedOrg
                        ? `${review.selectedOrg.orgName} will gain access to the platform as a verified organization.`
                        : undefined
                }
                confirmLabel="Approve"
                onConfirm={review.handleApprove}
            />
        </div>
    );
}
