"use client";

import { useOrganizationMessagesViewModel } from "@/app/(protected)/(app-shell)/organization/messages/messagesVm";
import { ChatComposer } from "@/components/common/chat/chat-composer";
import { ChatConversationList } from "@/components/common/chat/chat-conversation-list";
import { ChatMessageList } from "@/components/common/chat/chat-message-list";
import { ChatThreadHeader } from "@/components/common/chat/chat-thread-header";

export default function OrganizationMessagesPage() {
  const vm = useOrganizationMessagesViewModel();

  if (vm.loading) {
    return <main className="p-6">Loading...</main>;
  }

  if (vm.error) {
    return <main className="p-6 text-sm text-destructive">{vm.error}</main>;
  }

  return (
    <div className="h-[calc(100vh-73px)] overflow-hidden border-t border-border bg-background">
      <div className="grid h-full min-h-0 grid-cols-[320px_1fr]">
        <ChatConversationList
          conversations={vm.conversations}
          selectedConversationId={vm.selectedConversationId}
          onSelect={vm.selectConversation}
          sectionTitle="Inbox"
        />

        <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
          {vm.selectedConversation ? (
            <>
              <ChatThreadHeader
                title={vm.threadTitle}
                subtitle={vm.threadSubtitle}
                meta={vm.threadMeta}
                avatarFallback={vm.threadTitle.slice(0, 2).toUpperCase()}
              />

              <div className="min-h-0">
                    <ChatMessageList
                        messages={vm.selectedConversation.messages}
                        currentUserId={vm.currentUserId}
                        variant={vm.isTicketConversation ? "ticket" : "default"}
                    />
                </div>

              {vm.isClosedTicketConversation ? (
                <div className="border-t border-border px-4 py-4 text-sm text-muted-foreground">
                  This ticket is closed. Replies are disabled.
                </div>
              ) : (
                <ChatComposer
                  value={vm.messageDraft}
                  onChange={vm.setMessageDraft}
                  onSend={vm.sendMessage}
                  sending={vm.sending}
                  placeholder={
                    vm.isTicketConversation ? "Reply to support ticket..." : "Type a message..."
                  }
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground">
              Select a conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}