"use client";

import { useState, useEffect, useCallback } from "react";
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
      const response = await generateContent({ systemPrompt, userPrompt: content });
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear messages for the current chat
  const clearChatHistory = useCallback(() => {
    setMessages([]);
    setHasStartedChat(false);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    hasStartedChat,
    clearChatHistory,
  };
}
