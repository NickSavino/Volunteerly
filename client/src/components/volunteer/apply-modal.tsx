"use client";

import { AppModal } from "@/components/common/app-modal";
import { useState } from "react";

type ApplyModalProps = {
    open: boolean;
    oppName: string;
    onClose: () => void;
    onSubmit: (message: string) => Promise<void>;
};

export function ApplyModal({ open, onClose, onSubmit }: ApplyModalProps) {
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);

    const isEmpty = message.trim().length === 0;

    async function handleSubmit() {
        setTouched(true);
        if (submitting || isEmpty) return;
        setSubmitting(true);
        try {
            await onSubmit(message);
            setMessage("");
            setTouched(false);
        } finally {
            setSubmitting(false);
        }
    }

    function handleClose() {
        if (submitting) return;
        setMessage("");
        setTouched(false);
        onClose();
    }

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title="Apply to Opportunity"
            maxWidthClassName="sm:max-w-lg"
            footer={
                <>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="
                            h-11 min-w-24 rounded-xl border border-border bg-card px-5 text-sm
                            font-semibold text-foreground
                            hover:bg-secondary
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="
                            h-11 min-w-24 rounded-xl bg-primary px-5 text-sm font-semibold
                            text-foreground
                            hover:opacity-90
                            disabled:opacity-50
                        "
                    >
                        {submitting ? "Applying..." : "Apply"}
                    </button>
                </>
            }
        >
            <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                    Message to Organization:
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain why you should be selected ..."
                    rows={5}
                    disabled={submitting}
                    className={`
                        w-full resize-none rounded-xl border bg-muted px-4 py-3 text-sm
                        text-foreground
                        placeholder:text-muted-foreground
                        focus:ring-2 focus:ring-ring focus:outline-none
                        disabled:opacity-50
                        ${touched && isEmpty ? "border-destructive" : "border-border"}
                    `}
                />
                {touched && isEmpty && (
                    <p className="text-xs text-destructive">
                        Please write a message before applying.
                    </p>
                )}
            </div>
        </AppModal>
    );
}
