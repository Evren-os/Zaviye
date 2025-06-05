"use client"

import { useState, useEffect } from "react"
import type { Message, ChatType } from "@/lib/types"
import { generateContent } from "@/lib/gemini"
import { systemPrompts } from "@/lib/system-prompts"

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function useChat(chatType: ChatType) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasStartedChat, setHasStartedChat] = useState(false)

  // Load messages and chat state from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`zaviye-${chatType}-messages`)
    const savedChatState = localStorage.getItem(`zaviye-${chatType}-started`)

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)
      } catch (error) {
        console.error("Error parsing saved messages:", error)
        setMessages([])
      }
    } else {
      setMessages([])
    }

    if (savedChatState) {
      setHasStartedChat(JSON.parse(savedChatState))
    } else {
      setHasStartedChat(false)
    }
  }, [chatType])

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem(`zaviye-${chatType}-messages`, JSON.stringify(messages))
  }, [messages, chatType])

  // Save chat started state to localStorage
  useEffect(() => {
    localStorage.setItem(`zaviye-${chatType}-started`, JSON.stringify(hasStartedChat))
  }, [hasStartedChat, chatType])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Mark that this chat has started
    if (!hasStartedChat) {
      setHasStartedChat(true)
    }

    // Create a new user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    }

    // Update messages with the new user message
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Get the system prompt for the current chat type
      const systemPrompt = systemPrompts[chatType]

      const response = await generateContent({
        systemPrompt,
        userPrompt: content,
      })

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      // Update messages with the new assistant message
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      // Create an error message
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
    hasStartedChat,
  }
}
