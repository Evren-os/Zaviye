"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface MessageActionsToolbarProps {
  message: Message;
  isLastMessage: boolean;
  isLoading: boolean;
  isVisible: boolean;
  onCopyAction: () => void;
  onRegenerateAction: () => void;
}

export function MessageActionsToolbar({
  message,
  isLastMessage,
  isLoading,
  isVisible,
  onCopyAction,
  onRegenerateAction,
}: MessageActionsToolbarProps) {
  const canRegenerate = message.role === "assistant" && isLastMessage && !isLoading;

  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-all duration-200 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
      )}
      aria-hidden={!isVisible}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={onCopyAction}
        aria-label="Copy message"
      >
        <CopyIcon className="h-4 w-4" />
      </Button>
      {canRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          onClick={onRegenerateAction}
          aria-label="Regenerate response"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
