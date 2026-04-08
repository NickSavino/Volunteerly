"use client";

import { MessageSquareText } from "lucide-react";
import { AppModal } from "@/components/common/app-modal";
import { LoadingScreen } from "@/components/common/loading-screen";
import { UseTicketDetailViewModel } from "@/app/(protected)/(app-shell)/moderator/tickets/ticket-detail/ticketDetailVm";
import { ChatMessageList } from "@/components/common/chat/chat-message-list";
import { ChatComposer } from "@/components/common/chat/chat-composer";
import { ChatParticipantCard } from "@/components/common/chat/chat-participant-card";
import { Button } from "@/components/ui/button";

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
  const participant = vm.chatParticipant
  const isClosed = ticket?.status === "CLOSED";

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={ticket ? `Ticket #${ticket.id.slice(-8).toUpperCase()}` : "Ticket"}
      icon={<MessageSquareText className="size-6 text-muted-foreground" />}
      maxWidthClassName="sm:max-w-6xl"
      bodyClassName="p-0"
    >
      <div className="grid max-h-[78vh] grid-cols-1 overflow-hidden lg:grid-cols-[1.45fr_0.8fr]">
        <div className="grid min-h-[70vh] grid-rows-[1fr_auto] border-r border-border">
          {vm?.loading && !ticket ? (
            <LoadingScreen label="Loading ticket conversation..." />
          ) : vm?.error ? (
            <div className="p-6">
              <p className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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

              {!isClosed ? (
                <div className="border-t border-border px-4 py-4 text-sm text-muted-foreground">
                  This ticket is closed. Replies are disabled.
                </div>
              ) : vm?.canReply ? (
                <ChatComposer
                  value={vm.replyDraft}
                  onChange={vm.setReplyDraft}
                  onSend={vm.sendReply}
                  sending={vm.sending}
                  placeholder="Reply to ticket..."
                />
              ) : (
                 <div className="border-t border-border px-4 py-4 text-sm text-muted-foreground">
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
                      <Button type="button" onClick={vm.claimTicket} disabled={vm.updatingTicket}>
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
        </div>
      </div>
    </AppModal>
  );
}