"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import type { ChatType } from "@/lib/types";
import { useChat } from "@/hooks/use-chat";
import { introMessages } from "@/lib/system-prompts";
import { SettingsModal } from "./settings/settings-modal";
import { Button } from "./ui/button";
import { SettingsIcon } from "lucide-react";

interface ChatContainerProps {
  activeChat: ChatType;
  onChatChangeAction: (chat: ChatType) => void;
}

export function ChatContainer({ activeChat, onChatChangeAction }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    regenerateLastResponse,
    hasStartedChat,
    clearChatHistory,
  } = useChat(activeChat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const height = container.clientHeight;
      const maxScrollTop = scrollHeight - height;
      if (container.scrollTop > maxScrollTop - 100) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [messages, isLoading]);

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onCloseAction={() => setIsSettingsOpen(false)}
        activeChat={activeChat}
        clearChatHistoryAction={clearChatHistory}
      />

      {isInitialLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/98 backdrop-blur-md">
          <div className="zaviye-logo-container">
            <div className="zaviye-logo text-5xl font-bold tracking-tight">Zaviye</div>
            <div className="zaviye-particles">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen w-full flex flex-col overflow-hidden relative">
        <header className="absolute top-0 left-0 p-4 z-10">
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

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 messages-container">
          <div className="mx-auto max-w-3xl h-full">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              introMessage={introMessages[activeChat]}
              hasStartedChat={hasStartedChat}
              activeChat={activeChat}
              onRegenerateAction={regenerateLastResponse}
            />
            <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
          </div>
        </div>

        <div className="flex-shrink-0 p-4 pb-6">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSendAction={sendMessage}
              isLoading={isLoading}
              activeChat={activeChat}
              onChatChangeAction={onChatChangeAction}
            />
          </div>
        </div>
      </div>
    </>
  );
}
