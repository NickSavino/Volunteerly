"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AppModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidthClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
};

export function AppModal({
    open,
    onClose,
    title,
    description,
    icon,
    children,
    footer,
    maxWidthClassName = "sm:max-w-4xl",
    bodyClassName,
    footerClassName,
}: AppModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent
                aria-describedby={description ? undefined : undefined}
                className={cn(
                    `
                        flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-2xl border bg-card
                        p-0 shadow-2xl
                        [&>button]:hidden
                    `,
                    maxWidthClassName,
                )}
            >
                <DialogHeader className="flex-row items-center justify-between border-b px-6 py-5 text-left">
                    <div className="item-center flex gap-3">
                        {icon ? <div className="rounded-2xl bg-secondary p-3">{icon}</div> : null}
                        <DialogTitle className="text-[1.75rem] font-extrabold tracking-tight text-foreground">
                            {title}
                        </DialogTitle>
                    </div>

                    <DialogClose asChild>
                        <button
                            type="button"
                            aria-label="Close"
                            className="
                                rounded-md p-1 text-muted-foreground transition-colors
                                hover:text-foreground
                            "
                        >
                            <X className="size-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", bodyClassName)}>{children}</div>

                {footer ? (
                    <div className={cn("flex items-center justify-between border border-t px-6 py-4", footerClassName)}>
                        {footer}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
