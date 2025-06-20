"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Message, ChatType } from "@/lib/types";
import { generateContent } from "@/lib/gemini";
import { useSettings } from "@/hooks/use-settings";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useChat(chatType: ChatType) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const { getEffectiveSettings } = useSettings();

  useEffect(() => {
    const savedMessages = localStorage.getItem(`zaviye-${chatType}-messages`);
    const savedChatState = localStorage.getItem(`zaviye-${chatType}-started`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
    setHasStartedChat(savedChatState ? JSON.parse(savedChatState) : false);
  }, [chatType]);

  useEffect(() => {
    localStorage.setItem(`zaviye-${chatType}-messages`, JSON.stringify(messages));
  }, [messages, chatType]);

  useEffect(() => {
    localStorage.setItem(`zaviye-${chatType}-started`, JSON.stringify(hasStartedChat));
  }, [hasStartedChat, chatType]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    if (!hasStartedChat) setHasStartedChat(true);

    const userMessage: Message = { id: generateId(), role: "user", content, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { prompt: systemPrompt } = getEffectiveSettings(chatType);
      const userPrompt = content;

      const response = await generateContent({ systemPrompt, userPrompt });
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 1500 });
      }
      // Remove the last user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      toast.error("Could not find a message to regenerate.");
      return;
    }

    // Remove the last AI response to prepare for the new one
    setMessages((prev) => prev.slice(0, -1));
    setIsLoading(true);

    try {
      const { prompt: systemPrompt } = getEffectiveSettings(chatType);
      const userPrompt = lastUserMessage.content;

      const response = await generateContent({
        systemPrompt,
        userPrompt,
      });
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 1500 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = useCallback(() => {
    setMessages([]);
    setHasStartedChat(false);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    regenerateLastResponse,
    hasStartedChat,
    clearChatHistory,
  };
}
