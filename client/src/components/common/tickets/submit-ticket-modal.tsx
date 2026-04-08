"use client";

import { useState } from "react";
import { MessageCircleQuestionMark } from "lucide-react";
import type { CreatedTicket, TicketCategory, UrgencyRating } from "@volunteerly/shared";
import { AppModal } from "@/components/common/app-modal";
import { appToast } from "@/components/common/app-toast";
import { TicketService } from "@/services/TicketService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SubmitTicketModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmitted?: (ticket: CreatedTicket) => void;
};

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
    { value: "BUG", label: "Platform Bug" },
    { value: "ABUSE", label: "Abuse Report" },
    { value: "BILLING", label: "Billing" },
    { value: "OTHER", label: "Other" },
];

const URGENCY_OPTIONS: { value: UrgencyRating; label: string }[] = [
    { value: "MINOR", label: "Minor" },
    { value: "MODERATE", label: "Moderate" },
    { value: "SERIOUS", label: "Serious" },
];

export function SubmitTicketModal({ open, onClose, onSubmitted }: SubmitTicketModalProps) {
    const [category, setCategory] = useState<TicketCategory>("OTHER");
    const [urgencyRating, setUrgencyRating] = useState<UrgencyRating>("MODERATE");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);

    const titleInvalid = title.trim().length < 3;
    const descriptionInvalid = description.trim().length < 10;

    function resetForm() {
        setCategory("OTHER");
        setUrgencyRating("MODERATE");
        setTitle("");
        setDescription("");
        setTouched(false);
    }

    function handleClose() {
        if (submitting) return;
        resetForm();
        onClose();
    }

    async function handleSubmit() {
        setTouched(true);
        if (submitting || titleInvalid || descriptionInvalid) return;

        setSubmitting(true);

        try {
            const ticket = await TicketService.submitTicket({
                category,
                urgencyRating,
                title: title.trim(),
                description: description.trim(),
            });

            const shortId = ticket.id.slice(-8).toUpperCase();

            appToast.success(`Ticket #${shortId} submitted`, {
                message: "We opened a support thread in Messages. You can continue it there.",
            });

            resetForm();
            onSubmitted?.(ticket);
            onClose();
        } catch (error) {
            console.error(error);
            appToast.error("Failed to submit ticket", {
                message: "Please try again.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title="Contact Support"
            icon={<MessageCircleQuestionMark className="size-6 text-muted-foreground" />}
            maxWidthClassName="sm:max-w-xl"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Your description becomes the opening message in the support thread. After you submit, you can track
                    moderator replies in Messages.
                </p>

                <div
                    className="
                    grid gap-4
                    sm:grid-cols-2
                "
                >
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Urgency</Label>
                        <Select
                            value={urgencyRating}
                            onValueChange={(value) => setUrgencyRating(value as UrgencyRating)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {URGENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ticket-title">Title</Label>
                    <Input
                        id="ticket-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short summary of the issue"
                        disabled={submitting}
                    />
                    {touched && titleInvalid ? (
                        <p className="text-xs text-destructive">Use at least 3 characters.</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ticket-description">Description</Label>
                    <Textarea
                        id="ticket-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what happened and what help you need."
                        rows={6}
                        disabled={submitting}
                    />
                    {touched && descriptionInvalid ? (
                        <p className="text-xs text-destructive">Use at least 10 characters.</p>
                    ) : null}
                </div>
            </div>
        </AppModal>
    );
}
