/**
 * page.tsx
 * Organization messaging/inbox page - two-panel layout with conversation list and thread view
 */

"use client";

import { useOrganizationMessagesViewModel } from "@/app/(protected)/(app-shell)/organization/messages/messagesVm";
import { ChatComposer } from "@/components/common/chat/chat-composer";
import { ChatConversationList } from "@/components/common/chat/chat-conversation-list";
import { ChatMessageList } from "@/components/common/chat/chat-message-list";
import { ChatThreadHeader } from "@/components/common/chat/chat-thread-header";
import { LoadingScreen } from "@/components/common/loading-screen";
import { ArrowLeft } from "lucide-react";

export default function OrganizationMessagesPage() {
    const vm = useOrganizationMessagesViewModel();

    if (vm.loading) {
        return <LoadingScreen />;
    }

    if (vm.error) {
        return <main className="p-6 text-sm text-destructive">{vm.error}</main>;
    }

    return (
        <div className="h-[calc(100dvh-73px)] overflow-hidden border-t border-border bg-background">
            {/*
             * Two-column grid on desktop: fixed-width conversation list on the left,
             * flexible thread panel on the right. On mobile only one panel is visible
             * at a time - the list hides when a conversation is selected and vice versa.
             */}
            <div
                className="
                    grid h-full min-h-0 grid-cols-1
                    md:grid-cols-[320px_minmax(0,1fr)]
                "
            >
                {/* Conversation list panel - hidden on mobile when a thread is open */}
                <div
                    className={
                        vm.selectedConversation
                            ? `
                                hidden
                                md:block
                                min-h-0
                            `
                            : "block min-h-0"
                    }
                >
                    <ChatConversationList
                        conversations={vm.conversations}
                        selectedConversationId={vm.selectedConversationId}
                        onSelect={vm.selectConversation}
                        sectionTitle="Inbox"
                    />
                </div>

                {/* Thread detail panel - hidden on mobile when no conversation is selected */}
                <div
                    className={
                        vm.selectedConversation
                            ? "flex min-h-0 min-w-0 flex-col"
                            : `
                                hidden min-h-0 min-w-0
                                md:flex md:flex-col
                            `
                    }
                >
                    {vm.selectedConversation ? (
                        <>
                            {/* Mobile-only back button to return to the conversation list */}
                            <div
                                className="
                                    border-b border-border px-4 py-3
                                    md:hidden
                                "
                            >
                                <button
                                    type="button"
                                    onClick={vm.clearSelection}
                                    className="
                                        inline-flex items-center gap-2 text-sm font-medium
                                        text-foreground
                                    "
                                >
                                    <ArrowLeft className="size-4" />
                                    Back to inbox
                                </button>
                            </div>

                            <ChatThreadHeader
                                title={vm.threadTitle}
                                subtitle={vm.threadSubtitle}
                                meta={vm.threadMeta}
                                avatarFallback={vm.threadTitle.slice(0, 2).toUpperCase()}
                            />

                            <div className="min-h-0 flex-1 overflow-hidden">
                                <ChatMessageList
                                    messages={vm.selectedConversation.messages}
                                    currentUserId={vm.currentUserId}
                                    // Use ticket styling variant for support conversations
                                    variant={vm.isTicketConversation ? "ticket" : "default"}
                                />
                            </div>

                            {/* Show a disabled notice for closed tickets, otherwise show the composer */}
                            {vm.isClosedTicketConversation ? (
                                <div
                                    className="
                                        shrink-0 border-t border-border p-4 text-sm
                                        text-muted-foreground
                                    "
                                >
                                    This ticket is closed. Replies are disabled.
                                </div>
                            ) : (
                                <ChatComposer
                                    value={vm.messageDraft}
                                    onChange={vm.setMessageDraft}
                                    onSend={vm.sendMessage}
                                    sending={vm.sending}
                                    placeholder={
                                        vm.isTicketConversation
                                            ? "Reply to support ticket..."
                                            : "Type a message..."
                                    }
                                />
                            )}
                        </>
                    ) : (
                        // Empty state shown on desktop when no conversation is selected
                        <div
                            className="
                                hidden h-full items-center justify-center text-muted-foreground
                                md:flex
                            "
                        >
                            Select a conversation.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
