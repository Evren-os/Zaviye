"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SettingsSidebar, type SettingsTab } from "./settings-sidebar";
import { SettingsCustomization } from "./settings-customization";
import { SettingsData } from "./settings-data";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { ChatType } from "@/lib/types";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  activeChat: ChatType;
  clearChatHistoryAction: () => void;
}

export function SettingsModal({
  isOpen,
  onCloseAction,
  activeChat,
  clearChatHistoryAction,
}: SettingsModalProps) {
  const isMobile = useIsMobile();
  const { getEffectiveSettings, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("customization");
  const [mobileView, setMobileView] = useState<"sidebar" | "content">("sidebar");

  const [tabName, setTabName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const [initialTabName, setInitialTabName] = useState("");
  const [initialSystemPrompt, setInitialSystemPrompt] = useState("");

  const isDirty = tabName !== initialTabName || systemPrompt !== initialSystemPrompt;

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getEffectiveSettings(activeChat);
      setTabName(currentSettings.name);
      setSystemPrompt(currentSettings.prompt);

      setInitialTabName(currentSettings.name);
      setInitialSystemPrompt(currentSettings.prompt);

      setActiveTab("customization");
    }
  }, [isOpen, activeChat, getEffectiveSettings]);

  useEffect(() => {
    if (!isOpen || !isMobile) {
      setMobileView("sidebar");
    }
  }, [isOpen, isMobile]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (isMobile) {
      setMobileView("content");
    }
  };

  const handleSave = () => {
    if (!isDirty) return;
    updateSettings(activeChat, { name: tabName, prompt: systemPrompt });
    toast({
      title: "✅ Settings Saved",
      description: "Your changes have been saved to this browser.",
      duration: 3000,
    });
    onCloseAction();
  };

  const handleReset = () => {
    const defaultSettings = getEffectiveSettings(activeChat);
    setTabName(defaultSettings.name);
    setSystemPrompt(defaultSettings.prompt);
    toast({
      title: "↩️ Form Reset",
      description:
        "The form has been reset to the current saved settings. Click 'Save Changes' to revert to defaults.",
      duration: 4000,
    });
  };

  const handleResetToDefaults = () => {
    resetSettings(activeChat);
    const defaultSettings = getEffectiveSettings(activeChat);
    setTabName(defaultSettings.name);
    setSystemPrompt(defaultSettings.prompt);
    toast({
      title: "↩️ Settings Reset",
      description: "This tab has been reset to its default settings. Save to confirm.",
      duration: 3000,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "customization":
        return (
          <SettingsCustomization
            tabName={tabName}
            onTabNameChangeAction={setTabName}
            systemPrompt={systemPrompt}
            onSystemPromptChangeAction={setSystemPrompt}
          />
        );
      case "data":
        return (
          <SettingsData
            activeChat={activeChat}
            clearChatHistoryAction={clearChatHistoryAction}
            onCloseAction={onCloseAction}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent
        className={cn(
          "h-dvh w-screen max-h-dvh max-w-full rounded-none border-none",
          "sm:h-[90vh] sm:max-h-[700px] sm:w-[95vw] sm:max-w-4xl sm:rounded-lg sm:border sm:ring-1 sm:ring-primary/40",
          "p-0 flex flex-col gap-0",
        )}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            Settings for{" "}
            <span className="text-primary">{getEffectiveSettings(activeChat).name}</span>
          </DialogTitle>
          <DialogDescription>
            Manage customization and data for this chat persona.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 pt-4">
          {isMobile ? (
            mobileView === "sidebar" ? (
              <SettingsSidebar activeTab={activeTab} onTabChangeAction={handleTabChange} />
            ) : (
              <div className="w-full flex flex-col">
                <div className="p-2 border-b">
                  <Button variant="ghost" size="sm" onClick={() => setMobileView("sidebar")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">{renderContent()}</div>
              </div>
            )
          ) : (
            <>
              <SettingsSidebar activeTab={activeTab} onTabChangeAction={handleTabChange} />
              <div className="flex-1 overflow-y-auto border-l">{renderContent()}</div>
            </>
          )}
        </div>

        {(!isMobile || mobileView === "content") && (
          <DialogFooter className="p-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
            <Button variant="ghost" onClick={handleResetToDefaults}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" onClick={onCloseAction} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isDirty} className="flex-1 sm:flex-none">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
