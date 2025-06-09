"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AllChatSettings, ChatSettings, ChatType } from "@/lib/types";
import { systemPrompts } from "@/lib/system-prompts";

const DEFAULT_SETTINGS: AllChatSettings = {
  glitch: { name: "Glitch", prompt: systemPrompts.glitch },
  blame: { name: "Blame", prompt: systemPrompts.blame },
  reson: { name: "Reson", prompt: systemPrompts.reson },
};

const SETTINGS_STORAGE_KEY = "zaviye-chat-settings";

interface SettingsContextType {
  settings: AllChatSettings;
  getEffectiveSettings: (chatType: ChatType) => ChatSettings;
  updateSettings: (chatType: ChatType, newSettings: Partial<ChatSettings>) => void;
  resetSettings: (chatType: ChatType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [customSettings, setCustomSettings] = useState<Partial<AllChatSettings>>({});
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage only on the client, after the component has mounted.
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setCustomSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever customSettings change.
  useEffect(() => {
    if (!isMounted) return;

    try {
      if (Object.keys(customSettings).length > 0) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(customSettings));
      } else {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [customSettings, isMounted]);

  const getEffectiveSettings = useCallback(
    (chatType: ChatType): ChatSettings => {
      // On the server or before the client has mounted, always return default settings.
      if (!isMounted) {
        return DEFAULT_SETTINGS[chatType];
      }
      const defaults = DEFAULT_SETTINGS[chatType];
      const customs = customSettings[chatType] || {};
      return { ...defaults, ...customs };
    },
    [customSettings, isMounted],
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
