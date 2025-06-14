"use client";

import { useEffect, useState } from "react";
import { ChatContainer } from "@/components/chat-container";
import type { ChatType } from "@/lib/types";
import { SettingsProvider, useSettings } from "@/hooks/use-settings";
import { Toaster } from "@/components/ui/sonner";
import { useChat } from "@/hooks/use-chat";

function ChatPage() {
  const [activeChat, setActiveChat] = useState<ChatType>("glitch");
  const { getEffectiveSettings } = useSettings();
  const { hasStartedChat } = useChat(activeChat);

  useEffect(() => {
    const chatSettings = getEffectiveSettings(activeChat);
    if (hasStartedChat) {
      document.title = `Zaviye | ${chatSettings.name}`;
    } else {
      document.title = "Zaviye";
    }
  }, [activeChat, hasStartedChat, getEffectiveSettings]);

  return (
    <main className="flex flex-1 flex-col bg-background">
      <ChatContainer activeChat={activeChat} onChatChangeAction={setActiveChat} />
    </main>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <ChatPage />
      <Toaster richColors position="top-center" />
    </SettingsProvider>
  );
}
