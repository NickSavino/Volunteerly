"use client";

import { ReactNode } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmActionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    message: string;
    additionalInfo?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    icon?: ReactNode;
};

export function ConfirmActionDialog({
    open,
    onOpenChange,
    title = "Confirm",
    message,
    additionalInfo,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    confirmDisabled = false,
    icon,
}: ConfirmActionDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md rounded-2xl border bg-card p-0 shadow-2xl">
                <div className="relative px-6 pt-6 pb-8 text-center">
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => onOpenChange(false)}
                        className="
                            absolute top-4 right-4 rounded-md p-1 text-muted-foreground
                            transition-colors
                            hover:text-foreground
                        "
                    >
                        <X className="size-5" />
                    </button>

                    <div
                        className="
                        mx-auto mb-5 flex size-16 items-center justify-center rounded-full
                        bg-secondary
                    "
                    >
                        {icon ?? <Check className="size-7 text-primary" />}
                    </div>

                    <AlertDialogTitle asChild>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {title}
                        </h2>
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        <p className="mt-3 text-base text-muted-foreground">{message}</p>

                        {additionalInfo ? (
                            <p className="mt-2 text-sm text-muted-foreground">{additionalInfo}</p>
                        ) : null}
                    </AlertDialogDescription>

                    <div className="mt-8 flex items-center justify-center gap-3">
                        <AlertDialogCancel
                            className={cn(
                                `
                                    h-12 min-w-28 rounded-xl border border-border bg-card px-5
                                    text-sm font-semibold text-foreground
                                    hover:bg-secondary
                                `,
                            )}
                        >
                            {cancelLabel}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={confirmDisabled}
                            onClick={onConfirm}
                            className={cn(
                                `
                                    h-12 min-w-36 rounded-xl bg-primary px-5 text-sm font-semibold
                                    text-foreground
                                    hover:opacity-90
                                `,
                                confirmDisabled && "pointer-events-none opacity-50",
                            )}
                        >
                            <Check className="mr-2 size-4" />
                            {confirmLabel}
                        </AlertDialogAction>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
