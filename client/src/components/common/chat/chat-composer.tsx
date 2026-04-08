"use client";

import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void | Promise<void>;
    placeholder?: string;
    disabled?: boolean;
    sending?: boolean;
};

export function ChatComposer({
    value,
    onChange,
    onSend,
    placeholder = "Type a message...",
    disabled = false,
    sending = false,
}: ChatComposerProps) {
    return (
        <div className="border-t bg-background p-4">
            <div
                className="
                flex items-end gap-3 rounded-2xl border border-border bg-background p-3 shadow-sm
            "
            >
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || sending}
                    className="
                        min-h-[52px] resize-none border-0 bg-transparent shadow-none
                        focus-visible:ring-0
                    "
                    onKeyDown={async (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            await onSend();
                        }
                    }}
                />

                <Button
                    type="button"
                    size="icon"
                    className="size-11 rounded-xl"
                    disabled={disabled || sending || !value.trim()}
                    onClick={onSend}
                >
                    <SendHorizontal className="size-5" />
                </Button>
            </div>
        </div>
    );
}
