"use client";

import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { useChat } from "@/hooks/use-chat";
import { introMessages } from "@/lib/system-prompts";
import type { ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, SettingsIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SettingsModal } from "./settings/settings-modal";
import { Button } from "./ui/button";

interface ChatContainerProps {
  activeChat: ChatType;
  onChatChangeAction: (chat: ChatType) => void;
}

export function ChatContainer({
  activeChat,
  onChatChangeAction,
}: ChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    regenerateLastResponse,
    hasStartedChat,
    clearChatHistory,
    stopGeneration,
  } = useChat(activeChat);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevMessagesLength = useRef(messages.length);

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    if (behavior === "smooth") {
      setNewMessagesCount(0);
    }
  };

  // Initial scroll to bottom on chat load
  useLayoutEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto");
    }
    prevMessagesLength.current = messages.length;
  }, [activeChat]);

  // Handle new messages and auto-scrolling
  useEffect(() => {
    const newMessagesArrived = messages.length > prevMessagesLength.current;
    const lastMessageIsAssistant =
      messages[messages.length - 1]?.role === "assistant";

    if (newMessagesArrived && lastMessageIsAssistant) {
      if (isUserScrolledUp) {
        setNewMessagesCount((prevCount) => prevCount + 1);
        setShouldAnimate(true);
      } else {
        scrollToBottom("smooth");
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, isUserScrolledUp]);

  // Handle scroll events to show/hide the button and reset count
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 1;
      setIsUserScrolledUp(!atBottom);
      if (atBottom) {
        setNewMessagesCount(0);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset animation trigger
  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setShouldAnimate(false), 1500); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onCloseAction={() => setIsSettingsOpen(false)}
        activeChat={activeChat}
        clearChatHistoryAction={clearChatHistory}
      />

      <div
        className={cn(
          "h-dvh w-full flex flex-col overflow-hidden relative",
          "animate-in fade-in duration-500"
        )}
      >
        <header className="absolute top-0 left-0 p-2 md:p-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="sr-only">Open Settings</span>
          </Button>
        </header>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto messages-container relative"
        >
          <div className="mx-auto max-w-3xl h-full p-2 md:p-4">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              introMessage={introMessages[activeChat]}
              hasStartedChat={hasStartedChat}
              activeChat={activeChat}
              onRegenerateAction={regenerateLastResponse}
            />
            <div className="h-4 flex-shrink-0" />
          </div>

          <div
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ease-in-out",
              isUserScrolledUp
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            <Button
              onClick={() => scrollToBottom("smooth")}
              size="sm"
              className={cn(
                "rounded-full shadow-lg h-auto py-1.5 px-3 flex items-center gap-2 transition-all duration-200",
                newMessagesCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground border",
                shouldAnimate && "animate-new-message"
              )}
            >
              <ArrowDownIcon className="h-4 w-4" />
              {newMessagesCount > 0
                ? `${newMessagesCount} new message${
                    newMessagesCount > 1 ? "s" : ""
                  }`
                : "Scroll to bottom"}
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 p-2 pb-4 md:p-4 md:pb-6 z-10">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSendAction={sendMessage}
              isLoading={isLoading}
              activeChat={activeChat}
              onChatChangeAction={onChatChangeAction}
              stopGeneration={stopGeneration}
            />
          </div>
        </div>
      </div>
    </>
  );
}
