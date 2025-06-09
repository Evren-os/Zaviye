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
import { ArrowLeft } from "lucide-react";
import type { ChatType } from "@/lib/types";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChat: ChatType;
  clearChatHistory: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  activeChat,
  clearChatHistory,
}: SettingsModalProps) {
  const isMobile = useIsMobile();
  const { getEffectiveSettings, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("customization");
  const [mobileView, setMobileView] = useState<"sidebar" | "content">("sidebar");

  // Form state
  const [tabName, setTabName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  // Populate form state when modal opens or active chat changes
  useEffect(() => {
    if (isOpen) {
      const currentSettings = getEffectiveSettings(activeChat);
      setTabName(currentSettings.name);
      setSystemPrompt(currentSettings.prompt);
      // Reset to customization tab on open
      setActiveTab("customization");
    }
  }, [isOpen, activeChat, getEffectiveSettings]);

  // Reset mobile view when modal is closed or on screen resize
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
    updateSettings(activeChat, { name: tabName, prompt: systemPrompt });
    toast({
      title: "✅ Settings Saved",
      description: "Your changes have been saved to this browser.",
      duration: 3000,
    });
    onClose();
  };

  const handleReset = () => {
    resetSettings(activeChat);
    // We need to get the default settings again after resetting
    const defaultSettings = getEffectiveSettings(activeChat);
    setTabName(defaultSettings.name);
    setSystemPrompt(defaultSettings.prompt);
    toast({
      title: "↩️ Settings Reset",
      description: "This tab has been reset to its default settings.",
      duration: 3000,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "customization":
        return (
          <SettingsCustomization
            tabName={tabName}
            setTabName={setTabName}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
          />
        );
      case "data":
        return <SettingsData clearChatHistory={clearChatHistory} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-[95vw] h-[90vh] max-h-[650px] p-0 flex flex-col gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Manage customization and data controls for the application.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 min-h-0">
          {isMobile ? (
            mobileView === "sidebar" ? (
              <SettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />
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
              <SettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />
              <div className="flex-1 overflow-y-auto">{renderContent()}</div>
            </>
          )}
        </div>

        {(!isMobile || mobileView === "content") && (
          <DialogFooter className="p-4 border-t flex-row justify-between">
            <Button variant="ghost" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
