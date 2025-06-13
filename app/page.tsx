"use client";

import { useEffect, useState } from "react";
import { ChatContainer } from "@/components/chat-container";
import type { ChatType } from "@/lib/types";
import { SettingsProvider } from "@/hooks/use-settings";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [activeChat, setActiveChat] = useState<ChatType>("glitch");

  useEffect(() => {
    document.title = `Zaviye | ${activeChat.charAt(0).toUpperCase() + activeChat.slice(1)}`;
  }, [activeChat]);

  return (
    <SettingsProvider>
      <main className="flex min-h-screen flex-col items-center justify-between bg-background">
        <ChatContainer activeChat={activeChat} onChatChangeAction={setActiveChat} />
      </main>
      <Toaster richColors position="top-center" />
    </SettingsProvider>
  );
}