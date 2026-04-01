"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";


type ToastOptions = {
    message?: string;
    duration?: number;
};

type ToastKind = "success" | "error";

type ToastContentProps = {
    id: string | number;
    kind: ToastKind;
    title: string;
    message?: string;
};

function ToastContent({ id, kind, title, message} : ToastContentProps) {
    const accent =
        kind === "success"
            ? "border-l-4 border-l-success"
            : "border-l-4 border-l-destructive";

    const Icon = kind === "success" ? CheckCircle2 : AlertCircle;
    const iconBg = kind === "success" ? "bg-success" : "bg-destructive";

    return (
        <div
            className={`relative flex w-[320px] items-start gap-3 rounded-xl border bg-card px-4 py-4 shadow-xl ${accent}`}
        >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-foreground">{title}</p>
                {message ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
                ) : null}
            </div>

            <button
                type="button"
                aria-label="Dismiss"
                onClick={() => toast.dismiss(id)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function renderToast(kind: ToastKind, title: string, message?: string) {
    function renderToastContent(id: string | number) {
        return <ToastContent id={id} kind={kind} title={title} message={message} />
    }

    return renderToastContent
}

export const appToast = {
    success(title: string, options?: ToastOptions) {
        toast.custom(renderToast("success", title, options?.message), {
            duration: options?.duration ?? 3000,
        });
    },

    error(title: string, options?: ToastOptions) {
        toast.custom(renderToast("error", title, options?.message), {
            duration: options?.duration ?? 3000,
        });
    },
};