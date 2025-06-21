"use client";

import { useSettings } from "@/hooks/use-settings";
import { generateContent } from "@/lib/gemini";
import type { ChatType, Message } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function useChat(chatType: ChatType) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const { getEffectiveSettings } = useSettings();
  const abortControllerRef = useRef<AbortController | null>(null);

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
    localStorage.setItem(
      `zaviye-${chatType}-messages`,
      JSON.stringify(messages)
    );
  }, [messages, chatType]);

  useEffect(() => {
    localStorage.setItem(
      `zaviye-${chatType}-started`,
      JSON.stringify(hasStartedChat)
    );
  }, [hasStartedChat, chatType]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    if (isLoading) stopGeneration();
    if (!hasStartedChat) setHasStartedChat(true);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const { prompt: systemPrompt } = getEffectiveSettings(chatType);
      const response = await generateContent({
        systemPrompt,
        userPrompt: content,
        signal: abortControllerRef.current.signal,
      });
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message, { duration: 1500 });
      }
      // Remove the last user message on error, except for abort.
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const regenerateLastResponse = async () => {
    if (isLoading) stopGeneration();
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMessage) {
      toast.error("Could not find a message to regenerate.");
      return;
    }

    setMessages((prev) =>
      prev.filter(
        (msg) =>
          msg.role !== "assistant" || msg.timestamp < lastUserMessage.timestamp
      )
    );
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const { prompt: systemPrompt } = getEffectiveSettings(chatType);
      const response = await generateContent({
        systemPrompt,
        userPrompt: lastUserMessage.content,
        signal: abortControllerRef.current.signal,
      });
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message, { duration: 1500 });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
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
    stopGeneration,
  };
}
