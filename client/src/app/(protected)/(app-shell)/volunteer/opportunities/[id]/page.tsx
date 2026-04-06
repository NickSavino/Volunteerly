"use client";

import { use, useState } from "react";
import { ArrowLeft, Clock, TrendingUp, DollarSign, CheckCircle } from "lucide-react";
import { VolunteerNavbar } from "@/components/volunteer/volunteer-navbar";
import { VolunteerService } from "@/services/VolunteerService";
import { useVolOppDetailViewModel } from "./volOppDetailVm";
import { AppModal } from "@/components/common/app-modal";

export default function VolOppDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const vm = useVolOppDetailViewModel(id);

    if (vm.pageLoading) {
        return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading...</div>;
    }

    if (!vm.opp) {
        return <div className="flex min-h-screen items-center justify-center text-sm text-red-500">{vm.error ?? "Opportunity not found."}</div>;
    }

    const isCompleted = vm.opp.status === "CLOSED";
    const sortedUpdates = [...(vm.opp.progressUpdates ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <VolunteerNavbar currentVolunteer={vm.currentVolunteer ?? undefined} onSignOut={() => vm.router.push("/")} />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <button
                    onClick={() => vm.router.push("/volunteer")}
                    className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>

                {vm.error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{vm.error}</p>
                )}

                <div className="mb-1 flex items-center gap-2">
                    {isCompleted ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" /> COMPLETE
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                            <TrendingUp className="h-3.5 w-3.5" /> IN PROGRESS
                        </span>
                    )}
                    <span className="text-sm text-gray-400">
                        {isCompleted
                            ? `Completed ${new Date(vm.opp.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : `Started on ${new Date(vm.opp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        }
                    </span>
                </div>

                <h1 className="mb-1 text-3xl font-bold text-gray-900">{vm.opp.name}</h1>
                <p className="mb-6 text-sm text-gray-500">{vm.opp.category}</p>

                {isCompleted && (
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="mb-3 rounded-md bg-yellow-50 p-2 w-fit">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <p className="text-xs text-gray-500">Total Hours</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">{vm.totalHours}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="mb-3 rounded-md bg-yellow-50 p-2 w-fit">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <p className="text-xs text-gray-500">Economic Value</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">${vm.economicValue.toLocaleString()}</p>
                            <p className="mt-1 text-xs text-gray-400">Calculated at ${vm.currentVolunteer?.hourlyValue ?? 0}.00/hr</p>
                        </div>
                    </div>
                )}

                <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                                {vm.opp.organization?.orgName?.slice(0, 2).toUpperCase() ?? "OG"}
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Parent Organization</p>
                                <p className="text-lg font-bold text-gray-900">{vm.opp.organization?.orgName ?? "—"}</p>
                                <p className="text-sm text-gray-500">{vm.opp.organization?.causeCategory ?? ""}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => vm.setReviewModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
                        >
                            Post Review
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                        Progress Tracking
                    </h2>

                    {sortedUpdates.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-400">No progress updates yet.</p>
                    ) : (
                        <ol className="relative border-l border-gray-200 pl-6 space-y-6">
                            {sortedUpdates.map((update, idx) => {
                                const isFirst = idx === 0;
                                return (
                                    <li key={update.id} className="relative">
                                        <span className={`absolute -left-[1.45rem] top-1 h-3 w-3 rounded-full border-2 border-white ${isFirst ? "bg-yellow-400" : "bg-gray-300"}`} />
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            {new Date(update.createdAt).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            }).toUpperCase()}
                                            {isFirst && " · TODAY"}
                                        </p>
                                        <p className="mt-0.5 font-semibold text-gray-900">{update.title}</p>
                                        <p className="mt-1 text-sm text-gray-500">{update.description}</p>
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    {!isCompleted && (
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => vm.setProgressModalOpen(true)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                            >
                                Add Progress Update
                            </button>
                            <button
                                onClick={() => vm.setCompleteConfirmOpen(true)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Request to Complete
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <ProgressUpdateModal
                open={vm.progressModalOpen}
                submitting={vm.submitting}
                onClose={() => vm.setProgressModalOpen(false)}
                onSubmit={vm.submitProgressUpdate}
            />

            <ReviewModal
                open={vm.reviewModalOpen}
                orgName={vm.opp.organization?.orgName ?? ""}
                submitting={vm.submitting}
                onClose={() => vm.setReviewModalOpen(false)}
                onSubmit={vm.submitReview}
            />

            <AppModal
                open={vm.completeConfirmOpen}
                onClose={() => vm.setCompleteConfirmOpen(false)}
                title="Request Completion"
                maxWidthClassName="sm:max-w-md"
                footer={
                    <>
                        <button
                            onClick={() => vm.setCompleteConfirmOpen(false)}
                            disabled={vm.submitting}
                            className="h-11 min-w-24 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={vm.requestCompletion}
                            disabled={vm.submitting}
                            className="flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-foreground hover:opacity-90 disabled:opacity-50"
                        >
                            <CheckCircle className="h-4 w-4" />
                            {vm.submitting ? "Requesting..." : "Request"}
                        </button>
                    </>
                }
            >
                <div className="space-y-3 text-center py-2">
                    <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-yellow-400">
                            <CheckCircle className="h-7 w-7 text-yellow-500" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Are you sure you want to request to complete?</p>
                    <p className="text-sm text-gray-400">
                        This will email the organization letting them know they must review and mark as completed.
                    </p>
                </div>
            </AppModal>
        </div>
    );
}

function ProgressUpdateModal({
    open,
    submitting,
    onClose,
    onSubmit,
}: {
    open: boolean;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (input: { title: string; description: string; hoursContributed: number }) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hours, setHours] = useState("");
    const [touched, setTouched] = useState(false);

    const titleEmpty = title.trim().length === 0;
    const descEmpty = description.trim().length === 0;
    const hoursInvalid = isNaN(Number(hours)) || Number(hours) <= 0;

    async function handleSubmit() {
        setTouched(true);
        if (titleEmpty || descEmpty || hoursInvalid || submitting) return;
        await onSubmit({ title, description, hoursContributed: Number(hours) });
        setTitle(""); setDescription(""); setHours(""); setTouched(false);
    }

    function handleClose() {
        if (submitting) return;
        setTitle(""); setDescription(""); setHours(""); setTouched(false);
        onClose();
    }

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title="Progress Update"
            maxWidthClassName="sm:max-w-lg"
            footer={
                <>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="h-11 min-w-24 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-11 min-w-24 rounded-xl bg-primary px-5 text-sm font-semibold text-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Posting..." : "Post"}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Title:</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Provide title summary for your reason..."
                        disabled={submitting}
                        className={`w-full rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${touched && titleEmpty ? "border-destructive" : "border-border"}`}
                    />
                    {touched && titleEmpty && <p className="mt-1 text-xs text-destructive">Title is required.</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe reasons for rating..."
                        rows={4}
                        disabled={submitting}
                        className={`w-full resize-none rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${touched && descEmpty ? "border-destructive" : "border-border"}`}
                    />
                    {touched && descEmpty && <p className="mt-1 text-xs text-destructive">Description is required.</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Time Contributed:</label>
                    <input
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="Enter # of Hours..."
                        type="number"
                        min={0}
                        disabled={submitting}
                        className={`w-full rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${touched && hoursInvalid ? "border-destructive" : "border-border"}`}
                    />
                    {touched && hoursInvalid && <p className="mt-1 text-xs text-destructive">Enter a valid number of hours.</p>}
                </div>
            </div>
        </AppModal>
    );
}

function ReviewModal({
    open,
    orgName,
    submitting,
    onClose,
    onSubmit,
}: {
    open: boolean;
    orgName: string;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (input: { rating: number; flagged: boolean; flagReason?: string }) => Promise<void>;
}) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [flagged, setFlagged] = useState(false);
    const [flagReason, setFlagReason] = useState("");
    const [touched, setTouched] = useState(false);

    const ratingMissing = rating === 0;
    const flagReasonEmpty = flagged && flagReason.trim().length === 0;

    async function handleSubmit() {
        setTouched(true);
        if (ratingMissing || flagReasonEmpty || submitting) return;
        await onSubmit({ rating, flagged, flagReason: flagged ? flagReason : undefined });
        setRating(0); setFlagged(false); setFlagReason(""); setTouched(false);
    }

    function handleClose() {
        if (submitting) return;
        setRating(0); setFlagged(false); setFlagReason(""); setTouched(false);
        onClose();
    }

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title="Post Review"
            maxWidthClassName="sm:max-w-lg"
            footer={
                <>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="h-11 min-w-24 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-11 min-w-24 rounded-xl bg-primary px-5 text-sm font-semibold text-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Posting..." : "Post"}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-foreground">
                    Reviewing: <span className="font-semibold">{orgName}</span>
                </p>

                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                disabled={submitting}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                className="text-2xl leading-none disabled:opacity-50"
                            >
                                <span className={(hovered || rating) >= star ? "text-yellow-400" : "text-gray-300"}>★</span>
                            </button>
                        ))}
                    </div>
                    {touched && ratingMissing && <p className="mt-1 text-xs text-destructive">Please select a rating.</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={flagged}
                        onChange={(e) => setFlagged(e.target.checked)}
                        disabled={submitting}
                        className="h-4 w-4 rounded border-gray-300 accent-yellow-400"
                    />
                    <span className="text-sm text-foreground">Flag this organization</span>
                </label>

                {flagged && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Reason for flagging:</label>
                        <textarea
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="Describe why you are flagging this organization..."
                            rows={4}
                            disabled={submitting}
                            className={`w-full resize-none rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${touched && flagReasonEmpty ? "border-destructive" : "border-border"}`}
                        />
                        {touched && flagReasonEmpty && <p className="mt-1 text-xs text-destructive">Please provide a reason for flagging.</p>}
                    </div>
                )}
            </div>
        </AppModal>
    );
}