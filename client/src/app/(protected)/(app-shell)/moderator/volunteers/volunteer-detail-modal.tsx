"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Flag, ShieldAlert, UserRound } from "lucide-react";
import type {
    ModeratorUrgencyRating,
    ModeratorVolunteerDetail,
    ModeratorVolunteerEscalateInput,
    ModeratorVolunteerFlagInput,
    ModeratorVolunteerSuspendInput,
    ModeratorVolunteerWarnInput,
} from "@volunteerly/shared";
import { AppModal } from "@/components/common/app-modal";
import { appToast } from "@/components/common/app-toast";
import { ModeratorService } from "@/services/ModeratorService";
import { UserService } from "@/services/UserService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type VolunteerModalMode =
    | "profile"
    | "investigation"
    | "flag"
    | "warning"
    | "suspend"
    | "escalate";

type VolunteerDetailModalProps = {
    volunteerId: string | null;
    open: boolean;
    mode: VolunteerModalMode;
    onClose: () => void;
    onUpdated: () => Promise<void> | void;
};

const severityOptions: { value: ModeratorUrgencyRating; label: string }[] = [
    { value: "MINOR", label: "Minor" },
    { value: "MODERATE", label: "Moderate" },
    { value: "SERIOUS", label: "Serious" },
];

function stateLabel(state: ModeratorVolunteerDetail["state"]) {
    return state === "CLOSED" ? "Suspended" : state;
}

function actionLabel(action?: string | null) {
    switch (action) {
        case "WARNING":
            return "Warning issued";
        case "SUSPEND":
            return "Suspended";
        case "ESCALATE":
            return "Escalated";
        default:
            return "Open investigation";
    }
}

export function VolunteerDetailModal({
    volunteerId,
    open,
    mode,
    onClose,
    onUpdated,
}: VolunteerDetailModalProps) {
    const [currentMode, setCurrentMode] = useState<VolunteerModalMode>(mode);
    const [detail, setDetail] = useState<ModeratorVolunteerDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [flagForm, setFlagForm] = useState<ModeratorVolunteerFlagInput>({
        reason: "",
        details: "",
        severity: "MODERATE",
    });

    const [warnForm, setWarnForm] = useState<Pick<ModeratorVolunteerWarnInput, "reason" | "severity">>({
        reason: "",
        severity: "MODERATE",
    });

    const [suspendForm, setSuspendForm] = useState<Pick<ModeratorVolunteerSuspendInput, "reason" | "durationDays">>({
        reason: "",
        durationDays: 7,
    });

    const [escalateForm, setEscalateForm] = useState<Pick<ModeratorVolunteerEscalateInput, "reason">>({
        reason: "",
    });

    useEffect(() => {
        if (open) setCurrentMode(mode);
    }, [open, mode]);

    useEffect(() => {
        if (!open || !volunteerId) {
            setDetail(null);
            setError(null);
            return;
        }

        void loadDetail(volunteerId);
    }, [open, volunteerId]);

    const openReport = useMemo(
        () => detail?.reports.find((report) => report.isOpen),
        [detail]
    );

    const reportForView = useMemo(
        () => openReport ?? detail?.reports[0],
        [detail, openReport]
    )

    const hasOpenReport = !!openReport;
    const hasReportHistory = !!detail?.reports.length;
    const isSuspended = detail?.state === "CLOSED";

    async function loadDetail(id: string) {
        setLoading(true);
        setError(null);
        try {
            const next = await ModeratorService.getModeratorVolunteerDetail(id);
            setDetail(next);
        } catch {
            setError("Failed to load volunteer detail.");
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }

    function resetForms() {
        setFlagForm({ reason: "", details: "", severity: "MODERATE" });
        setWarnForm({ reason: "", severity: "MODERATE" });
        setSuspendForm({ reason: "", durationDays: 7 });
        setEscalateForm({ reason: "" });
    }

    function handleClose() {
        if (submitting) return;
        resetForms();
        onClose();
    }

    async function submitFlag() {
        if (isSuspended) {
            appToast.error("Volunteer already suspended", {
                message: "Suspended accounts cannot be flagged again.",
            });
            return;
        }

        if (!volunteerId || !flagForm.reason.trim()) return;
        setSubmitting(true);
        try {
            await ModeratorService.flagVolunteer(volunteerId, {
                reason: flagForm.reason.trim(),
                details: flagForm.details?.trim() ?? "",
                severity: flagForm.severity,
            });
            appToast.success("Volunteer flagged", { message: "The account is now in the flagged queue." });
            await onUpdated();
            handleClose();
        } catch {
            appToast.error("Flag failed", { message: "The volunteer could not be flagged." });
        } finally {
            setSubmitting(false);
        }
    }

    async function submitWarning() {
        if (isSuspended) {
            appToast.error("Volunteer already suspended", {
                message: "Suspended accounts can no longer receive additional moderation actions.",
            });
            return;
        }

        if (!volunteerId || !openReport?.id || !warnForm.reason.trim()) {
            if (!openReport) {
                appToast.error("No open investigation", {
                    message: "This report is already closed and can no longer be actioned.",
                });
            }
            return;
        }

        setSubmitting(true);
        try {
            await ModeratorService.warnVolunteer(volunteerId, {
                reportId: openReport.id,
                reason: warnForm.reason.trim(),
                severity: warnForm.severity,
            });
            appToast.success("Warning issued", { message: "The investigation was moved out of the flagged queue." });
            await onUpdated();
            handleClose();
        } catch {
            appToast.error("Warning failed", { message: "The warning could not be issued." });
        } finally {
            setSubmitting(false);
        }
    }

    async function submitSuspension() {
        if (isSuspended) {
            appToast.error("Volunteer already suspended", {
                message: "This account is already suspended.",
            });
            return;
        }

        if (!volunteerId || !openReport?.id || !suspendForm.reason.trim()) {
            if (!openReport) {
                appToast.error("No open investigation", {
                    message: "This report is already closed and can no longer be actioned.",
                });
            }
            return;
        }
        setSubmitting(true);
        try {
            await ModeratorService.suspendVolunteer(volunteerId, {
                reportId: openReport.id,
                reason: suspendForm.reason.trim(),
                durationDays: suspendForm.durationDays,
            });
            appToast.success("Volunteer suspended", { message: "The account was moved to the suspended tab." });
            await onUpdated();
            handleClose();
        } catch {
            appToast.error("Suspension failed", { message: "The volunteer could not be suspended." });
        } finally {
            setSubmitting(false);
        }
    }

    async function submitEscalation() {
        if (isSuspended) {
            appToast.error("Volunteer already suspended", {
                message: "Suspended accounts can no longer receive additional moderation actions.",
            });
            return;
        }

        if (!volunteerId || !openReport?.id || !escalateForm.reason.trim()) {
            if (!openReport) {
                appToast.error("No open investigation", {
                    message: "This report is already closed and can no longer be actioned.",
                });
            }
            return;
        }
        setSubmitting(true);
        try {
            await ModeratorService.escalateVolunteer(volunteerId, {
                reportId: openReport.id,
                reason: escalateForm.reason.trim(),
            });
            appToast.success("Investigation escalated", { message: "The account was moved to the suspended tab." });
            await onUpdated();
            handleClose();
        } catch {
            appToast.error("Escalation failed", { message: "The investigation could not be escalated." });
        } finally {
            setSubmitting(false);
        }
    }

    const title =
        currentMode === "profile"
            ? "Moderator View: Volunteer Profile"
            : currentMode === "investigation"
            ? `Investigation: ${detail?.firstName ?? ""} ${detail?.lastName ?? ""}`.trim()
            : currentMode === "flag"
            ? "Flag Account"
            : currentMode === "warning"
            ? "Issue Warning"
            : currentMode === "suspend"
            ? "Suspend Account"
            : "Escalate Investigation";

    const icon =
        currentMode === "profile" ? <UserRound className="size-6 text-muted-foreground" />
        : currentMode === "flag" ? <Flag className="size-6 text-muted-foreground" />
        : currentMode === "suspend" ? <ShieldAlert className="size-6 text-destructive" />
        : <AlertTriangle className="size-6 text-muted-foreground" />;

    const history = detail?.reports.length ? (
        <div className="space-y-3">
            {detail.reports.map((report) => (
                <div key={report.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-foreground">{report.reason}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString("en-US")}
                        </p>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Reported by {report.reporterDisplayName}
                    </p>

                    {report.details ? (
                        <p className="mt-2 text-sm text-muted-foreground">{report.details}</p>
                    ) : null}

                    <p className="mt-2 text-sm">
                        <span className="font-medium text-foreground">Outcome:</span>{" "}
                        {actionLabel(report.actionTaken)}
                    </p>

                    {report.moderatorNote ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Moderator note:</span>{" "}
                            {report.moderatorNote}
                        </p>
                    ) : null}

                    {report.suspensionUntil ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Suspended until:</span>{" "}
                            {new Date(report.suspensionUntil).toLocaleDateString("en-US")}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    ) : (
        <p className="text-sm text-muted-foreground">No moderation history yet.</p>
    );

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title={title}
            icon={icon}
            maxWidthClassName="sm:max-w-4xl"
            footerClassName="justify-between gap-3"
            footer={
                currentMode === "profile" ? (
                    <>
                        <Button 
                            variant="outline" 
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setCurrentMode("investigation")}
                                disabled={!hasReportHistory}
                            >
                                View Investigation
                            </Button>
                            <Button onClick={() => setCurrentMode("flag")} disabled={isSuspended}>
                                Flag Account
                            </Button>
                        </div>
                    </>
                ) : currentMode === "investigation" ? (
                    <>
                        <Button variant="outline" onClick={() => setCurrentMode("profile")}>Back</Button>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setCurrentMode("escalate")} disabled={!hasOpenReport || isSuspended}>Escalate</Button>
                            <Button variant="outline" onClick={() => setCurrentMode("warning")} disabled={!hasOpenReport || isSuspended}>Issue Warning</Button>
                            <Button variant="destructive" onClick={() => setCurrentMode("suspend")} disabled={!hasOpenReport || isSuspended}>Suspend</Button>
                        </div>
                    </>
                ) : currentMode === "flag" ? (
                    <>
                        <Button variant="outline" onClick={() => setCurrentMode("profile")} disabled={submitting}>Cancel</Button>
                        <Button onClick={submitFlag} disabled={submitting || !flagForm.reason.trim() || isSuspended}>
                            {submitting ? "Saving..." : "Flag Account"}
                        </Button>
                    </>
                ) : currentMode === "warning" ? (
                    <>
                        <Button variant="outline" onClick={() => setCurrentMode("investigation")} disabled={submitting}>Cancel</Button>
                        <Button onClick={submitWarning} disabled={submitting || !warnForm.reason.trim() || !openReport?.id || isSuspended}>
                            {submitting ? "Saving..." : "Issue Warning"}
                        </Button>
                    </>
                ) : currentMode === "suspend" ? (
                    <>
                        <Button variant="outline" onClick={() => setCurrentMode("investigation")} disabled={submitting}>Cancel</Button>
                        <Button variant="destructive" onClick={submitSuspension} disabled={submitting || !suspendForm.reason.trim() || !openReport?.id || isSuspended}>
                            {submitting ? "Saving..." : "Suspend Account"}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => setCurrentMode("investigation")} disabled={submitting}>Cancel</Button>
                        <Button onClick={submitEscalation} disabled={submitting || !escalateForm.reason.trim() || !openReport?.id || isSuspended}>
                            {submitting ? "Saving..." : "Confirm Escalation"}
                        </Button>
                    </>
                )
            }
        >
            {loading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Loading volunteer detail...</p>
            ) : error ? (
                <p className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </p>
            ) : !detail ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Volunteer not found.</p>
            ) : currentMode === "profile" ? (
                <div className="space-y-6">
                    <div className="flex items-start gap-4 rounded-2xl border p-5">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={UserService.getAvatarURL(detail.id)} />
                            <AvatarFallback>{detail.firstName[0]}{detail.lastName[0]}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="text-2xl font-bold text-foreground">{detail.firstName} {detail.lastName}</p>
                            <p className="text-sm text-muted-foreground">{detail.location || "No location provided"}</p>
                            <p className="mt-3 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide w-fit">
                                {stateLabel(detail.state)}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Past Flags</p><p className="mt-1 text-2xl font-bold">{detail.pastFlagsCount}</p></div>
                        <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="mt-1 text-2xl font-bold">{detail.completedOpportunities}</p></div>
                        <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Rating</p><p className="mt-1 text-2xl font-bold">{detail.averageRating.toFixed(1)}</p></div>
                        <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Hourly Value</p><p className="mt-1 text-2xl font-bold">${detail.hourlyValue}</p></div>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-foreground">Bio</p>
                        <p className="mt-2 text-sm text-muted-foreground">{detail.bio || "No bio provided."}</p>
                        <p className="mt-4 text-sm font-semibold text-foreground">Availability</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {(detail.availability ?? []).map(String).join(", ") || "No availability provided."}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-foreground">Skills</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {[...detail.technicalSkills, ...detail.nonTechnicalSkills].length ? (
                                [...detail.technicalSkills, ...detail.nonTechnicalSkills].map((skill) => (
                                    <span key={skill} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No extracted skills available.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-foreground">Moderation History</p>
                        <div className="mt-3">{history}</div>
                    </div>
                </div>
            ) : currentMode === "investigation" ? (
                <div className="space-y-6">
                    {reportForView ? (
                        <div className="rounded-xl border p-5">
                            <p className="text-xl font-bold text-foreground">{reportForView.reason}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Reported by {reportForView.reporterDisplayName} on{" "}
                                {new Date(reportForView.createdAt).toLocaleDateString("en-US")}
                            </p>
                            {reportForView.severity ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Severity: {reportForView.severity}
                                </p>
                            ) : null}
                            {reportForView.details ? (
                                <p className="mt-4 text-sm text-muted-foreground">{reportForView.details}</p>
                            ) : null}

                            {!hasOpenReport ? (
                                <p className="mt-4 rounded-md border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
                                    This investigation is already closed. You can review the history, but no further action can be taken.
                                </p>
                            ) : null}

                            {isSuspended ? (
                                <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                    This volunteer is already suspended. Additional suspension or escalation actions are disabled.
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No report is attached to this volunteer.</p>
                    )}

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-foreground">Volunteer Snapshot</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {detail.firstName} {detail.lastName} - {detail.location || "No location"} - {stateLabel(detail.state)}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-foreground">Report History</p>
                        <div className="mt-3">{history}</div>
                    </div>
                </div>
            ) : currentMode === "flag" ? (
                <div className="space-y-4">
                    <div>
                        <Label>Reason</Label>
                        <Input
                            value={flagForm.reason}
                            onChange={(e) => setFlagForm((prev) => ({ ...prev, reason: e.target.value }))}
                            placeholder="e.g. Repeated no-shows"
                        />
                    </div>

                    <div>
                        <Label>Severity</Label>
                        <Select
                            value={flagForm.severity}
                            onValueChange={(value) => setFlagForm((prev) => ({ ...prev, severity: value as ModeratorUrgencyRating }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                                {severityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            rows={5}
                            value={flagForm.details}
                            onChange={(e) => setFlagForm((prev) => ({ ...prev, details: e.target.value }))}
                            placeholder="Provide moderator-only context for this flag..."
                        />
                    </div>
                </div>
            ) : currentMode === "warning" ? (
                <div className="space-y-4">
                    <div>
                        <Label>Reason for Warning</Label>
                        <Textarea
                            rows={5}
                            value={warnForm.reason}
                            onChange={(e) => setWarnForm((prev) => ({ ...prev, reason: e.target.value }))}
                            placeholder="Describe the violation and what the volunteer must correct..."
                        />
                    </div>

                    <div>
                        <Label>Severity</Label>
                        <Select
                            value={warnForm.severity}
                            onValueChange={(value) => setWarnForm((prev) => ({ ...prev, severity: value as ModeratorUrgencyRating }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                                {severityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ) : currentMode === "suspend" ? (
                <div className="space-y-4">
                    <div>
                        <Label>Suspension Duration (days)</Label>
                        <Select
                            value={String(suspendForm.durationDays)}
                            onValueChange={(value) => setSuspendForm((prev) => ({ ...prev, durationDays: Number(value) }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Reason for Suspension</Label>
                        <Textarea
                            rows={5}
                            value={suspendForm.reason}
                            onChange={(e) => setSuspendForm((prev) => ({ ...prev, reason: e.target.value }))}
                            placeholder="Provide the suspension reason that should remain in moderator history..."
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <Label>Reason for Escalation</Label>
                        <Textarea
                            rows={5}
                            value={escalateForm.reason}
                            onChange={(e) => setEscalateForm({ reason: e.target.value })}
                            placeholder="Explain why this case needs escalation..."
                        />
                    </div>
                </div>
            )}
        </AppModal>
    );
}
