/**
 * ticketDetailModal.tsx
 * Displays ticket details, conversation history, and moderator actions.
 */

"use client";

import { UseTicketDetailViewModel } from "@/app/(protected)/(app-shell)/moderator/tickets/ticket-detail/ticketDetailVm";
import { AppModal } from "@/components/common/app-modal";
import { ChatComposer } from "@/components/common/chat/chat-composer";
import { ChatMessageList } from "@/components/common/chat/chat-message-list";
import { ChatParticipantCard } from "@/components/common/chat/chat-participant-card";
import { LoadingScreen } from "@/components/common/loading-screen";
import { Button } from "@/components/ui/button";
import { ModeratorTicketDetail } from "@volunteerly/shared";
import { MessageSquareText } from "lucide-react";

type TicketDetailModalProps = {
    ticketId: string | null;
    open: boolean;
    onClose: () => void;
    currentUserId: string;
    onTicketUpdated?: () => Promise<void> | void;
};

export function TicketDetailModal({
    ticketId,
    open,
    onClose,
    currentUserId,
    onTicketUpdated,
}: TicketDetailModalProps) {
    const vm = UseTicketDetailViewModel({
        ticketId,
        open,
        currentUserId,
        onTicketUpdated,
    });

    const ticket = vm.ticket;
    const participant = vm.chatParticipant;
    const isClosed = ticket?.status === "CLOSED";

    function formatCategory(category: ModeratorTicketDetail["category"]) {
        switch (category) {
            case "BUG":
                return "Platform Bug";
            case "ABUSE":
                return "Abuse Report";
            case "BILLING":
                return "Billing";
            case "OTHER":
                return "General Inquiry";
            default:
                return category;
        }
    }

    function getUrgencyClasses(urgency: ModeratorTicketDetail["urgencyRating"]) {
        switch (urgency) {
            case "SERIOUS":
                return "bg-destructive text-destructive-foreground";
            case "MODERATE":
                return "bg-orange-500 text-white";
            case "MINOR":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-secondary text-foreground";
        }
    }

    function getTimeOpen(createdAt: string) {
        const created = new Date(createdAt).getTime();
        const diffMs = Math.max(0, Date.now() - created);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} Day${days === 1 ? "" : "s"}`;
        if (hours > 0) return `${hours} Hour${hours === 1 ? "" : "s"}`;
        return "Less than 1 Hour";
    }

    return (
        <AppModal
            open={open}
            onClose={onClose}
            title={ticket ? `Ticket #${ticket.id.slice(-8).toUpperCase()}` : "Ticket"}
            icon={<MessageSquareText className="size-6 text-muted-foreground" />}
            maxWidthClassName="sm:max-w-6xl"
            bodyClassName="p-0"
        >
            <div
                className="
                    grid max-h-[78vh] grid-cols-1 overflow-hidden
                    lg:grid-cols-[1.45fr_0.8fr]
                "
            >
                <div className="grid min-h-[70vh] grid-rows-[1fr_auto] border-r border-border">
                    {vm.loading && !ticket ? (
                        <LoadingScreen label="Loading ticket conversation..." />
                    ) : vm.error ? (
                        <div className="p-6">
                            <p
                                className="
                                    rounded-md border border-destructive/20 bg-destructive/5 px-4
                                    py-3 text-sm text-destructive
                                "
                            >
                                {vm.error}
                            </p>
                        </div>
                    ) : (
                        <>
                            <ChatMessageList
                                messages={ticket?.conversation?.messages ?? []}
                                currentUserId={currentUserId}
                                variant="ticket"
                                className="h-[60vh]"
                            />

                            {isClosed ? (
                                <div
                                    className="
                                        border-t border-border p-4 text-sm text-muted-foreground
                                    "
                                >
                                    This ticket is closed. Replies are disabled.
                                </div>
                            ) : vm.canReply ? (
                                <ChatComposer
                                    value={vm.replyDraft}
                                    onChange={vm.setReplyDraft}
                                    onSend={vm.sendReply}
                                    sending={vm.sending}
                                    placeholder="Reply to ticket..."
                                />
                            ) : (
                                <div
                                    className="
                                        border-t border-border p-4 text-sm text-muted-foreground
                                    "
                                >
                                    Claim this ticket to reply.
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="bg-background">
                    {participant ? (
                        <ChatParticipantCard
                            displayName={participant.displayName}
                            subtitle={participant.role}
                            avatarFallback={participant.displayName.slice(0, 2).toUpperCase()}
                            actions={
                                !isClosed ? (
                                    <>
                                        {vm.canClaim ? (
                                            <Button
                                                type="button"
                                                onClick={vm.claimTicket}
                                                disabled={vm.updatingTicket}
                                            >
                                                {vm.updatingTicket ? "Claiming..." : "Claim Ticket"}
                                            </Button>
                                        ) : null}

                                        {vm.canClose ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={vm.closeTicket}
                                                disabled={vm.updatingTicket}
                                            >
                                                {vm.updatingTicket ? "Closing..." : "Close Ticket"}
                                            </Button>
                                        ) : null}
                                    </>
                                ) : undefined
                            }
                        />
                    ) : (
                        <div className="p-6 text-sm text-muted-foreground">
                            Participant details unavailable.
                        </div>
                    )}

                    {ticket ? (
                        <div className="p-6">
                            <h4 className="text-3xl font-bold text-foreground">Ticket Info</h4>

                            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
                                <div className="grid grid-cols-[auto_1fr]">
                                    <p
                                        className="
                                            border-r border-b p-4 text-lg font-semibold
                                            text-foreground
                                        "
                                    >
                                        Category:
                                    </p>
                                    <p className="border-b p-4 text-lg text-muted-foreground">
                                        {formatCategory(ticket.category)}
                                    </p>

                                    <p
                                        className="
                                            border-r border-b p-4 text-lg font-semibold
                                            text-foreground
                                        "
                                    >
                                        Priority:
                                    </p>
                                    <div className="border-b p-4">
                                        <span
                                            className={`
                                                inline-flex rounded-full px-4 py-1 text-sm font-bold
                                                uppercase
                                                ${getUrgencyClasses(ticket.urgencyRating)}
                                            `}
                                        >
                                            {ticket.urgencyRating}
                                        </span>
                                    </div>

                                    <p
                                        className="
                                            border-r border-b p-4 text-lg font-semibold
                                            text-foreground
                                        "
                                    >
                                        Time Open:
                                    </p>
                                    <p className="border-b p-4 text-lg text-muted-foreground">
                                        {getTimeOpen(ticket.createdAt)}
                                    </p>

                                    <p
                                        className="
                                            border-r p-4 text-lg font-semibold text-foreground
                                        "
                                    >
                                        Status:
                                    </p>
                                    <p className="p-4 text-lg text-muted-foreground">
                                        {ticket.status === "OPEN" ? "Open" : "Closed"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </AppModal>
    );
}
