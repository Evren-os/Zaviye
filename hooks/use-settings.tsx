"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AllChatSettings, ChatSettings, ChatType } from "@/lib/types";
import { systemPrompts } from "@/lib/system-prompts";

const DEFAULT_SETTINGS: AllChatSettings = {
  glitch: { name: "Glitch", prompt: systemPrompts.glitch },
  blame: { name: "Blame", prompt: systemPrompts.blame },
  reson: { name: "Reson", prompt: systemPrompts.reson },
};

// Define a key for localStorage
const SETTINGS_STORAGE_KEY = "zaviye-chat-settings";

interface SettingsContextType {
  settings: AllChatSettings;
  getEffectiveSettings: (chatType: ChatType) => ChatSettings;
  updateSettings: (chatType: ChatType, newSettings: Partial<ChatSettings>) => void;
  resetSettings: (chatType: ChatType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from a function that reads from localStorage
  const [customSettings, setCustomSettings] = useState<Partial<AllChatSettings>>(() => {
    // Runs only on the initial render
    try {
      const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : {};
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      return {};
    }
  });

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    try {
      // Don't save an empty object
      if (Object.keys(customSettings).length > 0) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(customSettings));
      } else {
        // If custom settings are empty, remove the key from storage
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [customSettings]);

  const getEffectiveSettings = useCallback(
    (chatType: ChatType): ChatSettings => {
      const defaults = DEFAULT_SETTINGS[chatType];
      const customs = customSettings[chatType] || {};
      return { ...defaults, ...customs };
    },
    [customSettings],
  );

  const updateSettings = (chatType: ChatType, newSettings: Partial<ChatSettings>) => {
    setCustomSettings((prev) => ({
      ...prev,
      [chatType]: {
        ...prev[chatType],
        ...newSettings,
      },
    }));
  };

  const resetSettings = (chatType: ChatType) => {
    setCustomSettings((prev) => {
      const newState = { ...prev };
      delete newState[chatType];
      return newState;
    });
  };

  const value = {
    settings: DEFAULT_SETTINGS,
    getEffectiveSettings,
    updateSettings,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
