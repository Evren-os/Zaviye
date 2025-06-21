"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/hooks/use-settings";
import type { ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  GitBranchIcon,
  SendIcon,
  SquareIcon,
  VolumeXIcon,
  ZapIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSendAction: (message: string) => void;
  isLoading: boolean;
  activeChat: ChatType;
  onChatChangeAction: (chat: ChatType) => void;
  stopGeneration: () => void;
}

export function ChatInput({
  onSendAction,
  isLoading,
  activeChat,
  onChatChangeAction,
  stopGeneration,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getEffectiveSettings } = useSettings();
  const isMobile = useIsMobile();
  const activeChatSettings = getEffectiveSettings(activeChat);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 80), 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendAction(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "80px";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit(e);
      }
    }
  };

  const tabs: { id: ChatType; label: string; icon: React.ReactNode }[] = [
    {
      id: "glitch",
      label: getEffectiveSettings("glitch").name,
      icon: <ZapIcon className="h-4 w-4" />,
    },
    {
      id: "blame",
      label: getEffectiveSettings("blame").name,
      icon: <GitBranchIcon className="h-4 w-4" />,
    },
    {
      id: "reson",
      label: getEffectiveSettings("reson").name,
      icon: <VolumeXIcon className="h-4 w-4" />,
    },
  ];

  const activeTab = tabs.find((tab) => tab.id === activeChat);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg transition-all duration-300",
            isFocused
              ? "ring-2 ring-primary/20 border-primary/30"
              : "border-border"
          )}
        >
          <div className="relative p-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                activeChatSettings.placeholder || "Type your message..."
              }
              className="no-focus-outline resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground/60 min-h-[80px] transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-2">
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                    >
                      {activeTab?.icon}
                      <span>{activeTab?.label}</span>
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {tabs.map((tab) => (
                      <DropdownMenuItem
                        key={tab.id}
                        onClick={() => onChatChangeAction(tab.id)}
                        className={cn(activeChat === tab.id && "bg-muted")}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onChatChangeAction(tab.id)}
                    type="button"
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 ease-out overflow-hidden",
                      activeChat === tab.id
                        ? "bg-primary/8 text-primary border border-primary/20 tab-active"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent hover:border-muted/30"
                    )}
                  >
                    {activeChat === tab.id && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg animate-pulse" />
                        <div className="absolute inset-[1px] bg-gradient-to-r from-transparent via-primary/8 to-transparent rounded-[7px]" />
                      </>
                    )}
                    <span className="relative z-10 flex items-center justify-center">
                      {tab.icon}
                    </span>
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type={isLoading ? "button" : "submit"}
                  size="icon"
                  onClick={isLoading ? stopGeneration : undefined}
                  disabled={!input.trim() && !isLoading}
                  className={cn(
                    "rounded-lg h-8 w-8 transition-colors duration-200",
                    isLoading && "bg-primary hover:bg-primary/90"
                  )}
                  aria-label={isLoading ? "Stop generating" : "Send message"}
                >
                  <div className="relative h-4 w-4 flex items-center justify-center overflow-hidden">
                    <SquareIcon
                      className={cn(
                        "absolute transition-all duration-300 ease-in-out",
                        isLoading
                          ? "opacity-100 scale-100"
                          : "opacity-0 -translate-y-full scale-50"
                      )}
                      fill="currentColor"
                    />
                    <SendIcon
                      className={cn(
                        "absolute transition-all duration-300 ease-in-out",
                        isLoading
                          ? "opacity-0 translate-y-full scale-50"
                          : "opacity-100 scale-100"
                      )}
                    />
                  </div>
                </Button>
              </TooltipTrigger>
              {isLoading && (
                <TooltipContent>
                  <p>Stop generating</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
