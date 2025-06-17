"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/loading-dots";
import { tabDescriptions } from "@/lib/system-prompts";
import type { Message, ChatType } from "@/lib/types";
import { CodeBlock } from "./code-block";
import { MessageActionsToolbar } from "./message-actions-toolbar";
import { useIsMobile } from "@/components/ui/use-mobile";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  introMessage?: string;
  hasStartedChat: boolean;
  activeChat: ChatType;
  onRegenerateAction: () => void;
}

// A simple parser to split text and code blocks
const parseMessageContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) {
        const code = part.replace(/^```|```$/g, "").trim();
        return { type: "code" as const, content: code };
      }
      return { type: "text" as const, content: part };
    })
    .filter((part) => part.content.length > 0);
};

export function ChatMessages({
  messages,
  isLoading,
  introMessage,
  hasStartedChat,
  activeChat,
  onRegenerateAction,
}: ChatMessagesProps) {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [activeToolbarId, setActiveToolbarId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", { duration: 1500 });
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleContainerClick = () => {
    if (activeToolbarId) {
      setActiveToolbarId(null);
    }
  };

  const handleMessageClick = (e: React.MouseEvent, messageId: string) => {
    if (isMobile) {
      e.stopPropagation();
      setActiveToolbarId(activeToolbarId === messageId ? null : messageId);
    }
  };

  const shouldShowIntro = !hasStartedChat && !isLoading && introMessage;

  return (
    <div className="flex flex-col h-full" onClick={handleContainerClick}>
      {shouldShowIntro ? (
        <div className="flex items-center justify-center flex-1">
          <div className="max-w-md text-center space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 sm:p-5 border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {activeChat.charAt(0).toUpperCase() + activeChat.slice(1)}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-3">{introMessage}</p>
              <div className="mt-3">
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expandedDescription ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="pt-2">
                    <p className="text-muted-foreground/80 text-xs leading-relaxed bg-background/50 p-3 rounded-lg border">
                      {tabDescriptions[activeChat]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedDescription(!expandedDescription)}
                  className="text-primary/80 hover:text-primary text-xs mt-2 transition-colors duration-200 font-medium"
                >
                  {expandedDescription ? "Show less" : "Learn more"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : messages.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-center text-muted-foreground text-sm">Start a conversation...</p>
        </div>
      ) : (
        <div className="space-y-3 py-4">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const messageParts = parseMessageContent(message.content);

            return (
              <div
                key={message.id}
                className={cn(
                  "group/message flex w-full flex-col gap-[7px]",
                  message.role === "user" ? "items-end" : "items-start",
                )}
                onMouseEnter={!isMobile ? () => setActiveToolbarId(message.id) : undefined}
                onMouseLeave={!isMobile ? () => setActiveToolbarId(null) : undefined}
              >
                <div
                  className={cn(
                    "relative max-w-[85%] rounded-xl px-3.5 py-2.5 transition-all duration-300 text-left",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/80 backdrop-blur-sm border shadow-sm",
                    isMobile && "cursor-pointer",
                  )}
                  onClick={(e) => handleMessageClick(e, message.id)}
                >
                  <div className="prose-xs text-sm break-words whitespace-pre-wrap">
                    {messageParts.map((part, partIndex) =>
                      part.type === "code" ? (
                        <CodeBlock key={partIndex} code={part.content} />
                      ) : (
                        <span key={partIndex}>{part.content}</span>
                      ),
                    )}
                  </div>
                </div>
                <MessageActionsToolbar
                  message={message}
                  isLastMessage={isLastMessage}
                  isLoading={isLoading}
                  isVisible={activeToolbarId === message.id}
                  onCopyAction={() => {
                    copyToClipboard(message.content);
                    setActiveToolbarId(null);
                  }}
                  onRegenerateAction={() => {
                    onRegenerateAction();
                    setActiveToolbarId(null);
                  }}
                />
              </div>
            );
          })}

          {isLoading && (
            <div className="flex w-full justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-[85%] rounded-xl bg-muted/80 backdrop-blur-sm border px-3.5 py-2.5 shadow-sm">
                <LoadingDots />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
