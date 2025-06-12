"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/loading-dots";
import { tabDescriptions } from "@/lib/system-prompts";
import type { Message, ChatType } from "@/lib/types";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  introMessage?: string;
  hasStartedChat: boolean;
  activeChat: ChatType;
}

export function ChatMessages({
  messages,
  isLoading,
  introMessage,
  hasStartedChat,
  activeChat,
}: ChatMessagesProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [expandedDescription, setExpandedDescription] = useState(false);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", {
        duration: 1500,
      });
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const shouldShowIntro = !hasStartedChat && !isLoading && introMessage;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-full">
        {shouldShowIntro ? (
          <div className="flex items-center justify-center flex-1">
            <div className="max-w-md text-center space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-5 border">
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
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            {messages.map((message, index) => {
              const isCopied = copiedMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "group/message flex w-full message-item",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div
                    className={cn(
                      "relative max-w-[85%] rounded-xl px-3.5 py-2.5 transition-all duration-300",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/80 backdrop-blur-sm border shadow-sm",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="prose-xs text-sm break-words whitespace-pre-wrap flex-1">
                        {message.content}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 shrink-0 rounded-md transition-all duration-200",
                              "opacity-50 group-hover/message:opacity-100 focus-visible:opacity-100",
                              isCopied
                                ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 !opacity-100"
                                : message.role === "user"
                                  ? "text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                                  : "text-muted-foreground/70 hover:bg-background/50 hover:text-foreground",
                            )}
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            {isCopied ? (
                              <CheckIcon className="h-3 w-3 animate-in zoom-in-150" />
                            ) : (
                              <CopyIcon className="h-3 w-3" />
                            )}
                            <span className="sr-only">Copy message</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isCopied ? "Copied!" : "Copy"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
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
    </TooltipProvider>
  );
}
