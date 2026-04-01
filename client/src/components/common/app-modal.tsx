"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "../../lib/utils";

type AppModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidthClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
}

export function AppModal({
    open,
    onClose,
    title,
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
                className={cn(
                    "gap-0 overflow-hidden rounded-2xl border bg-card p-0 shadow-2xl [&>button]:hidden",
                    maxWidthClassName
                )}>
                    <DialogHeader className="flex-row items-center justify-between border-b px-6 py-5 text-left">
                        <div className="flex item-center gap-3">
                            {icon ? <div className="rounded-2xl bg-secondary p-3">{icon}</div> : null}
                            <DialogTitle className="text-[1.75rem] font-extrabold tracking-tight text-foreground">
                                {title}
                            </DialogTitle>
                        </div>

                        <DialogClose asChild>
                            <button
                                type="button"
                                aria-label="Close"
                                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </DialogClose>
                    </DialogHeader>

                    <div className={cn("px-6 py-5", bodyClassName)}>{children}</div>

                    {footer ? (
                        <div
                            className={cn(
                                "flex items-center justify-between border-t border px-6 py-4",
                                footerClassName
                            )}
                        >
                            {footer}
                        </div>
                    ) : null}
                </DialogContent>
        </Dialog>
    )
}