"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, ZapIcon, GitBranchIcon, VolumeXIcon } from "lucide-react";
import type { ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  activeChat: ChatType;
  setActiveChat: (chat: ChatType) => void;
}

export function ChatInput({ onSend, isLoading, activeChat, setActiveChat }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getEffectiveSettings } = useSettings();

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
      onSend(input.trim());
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

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex flex-col rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg transition-all duration-300",
          isFocused ? "ring-2 ring-primary/20 border-primary/30" : "border-border",
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
            placeholder="Type your message..."
            className="no-focus-outline resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground/60 min-h-[80px] transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between p-3 pt-0">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChat(tab.id)}
                type="button"
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 ease-out overflow-hidden",
                  activeChat === tab.id
                    ? "bg-primary/8 text-primary border border-primary/20 tab-active"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent hover:border-muted/30",
                )}
              >
                {activeChat === tab.id && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg animate-pulse" />
                    <div className="absolute inset-[1px] bg-gradient-to-r from-transparent via-primary/8 to-transparent rounded-[7px]" />
                  </>
                )}

                <span className="relative z-10 flex items-center justify-center">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <Button
            type="submit"
            size="sm"
            className={cn(
              "rounded-lg px-3 py-2 transition-all",
              input.trim() && !isLoading
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed opacity-70",
            )}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
