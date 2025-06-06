"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import type { ChatType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const { getEffectiveSettings, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();

  const [tabName, setTabName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getEffectiveSettings(activeChat);
      setTabName(currentSettings.name);
      setSystemPrompt(currentSettings.prompt);
    }
  }, [isOpen, activeChat, getEffectiveSettings]);

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
    const defaultSettings = getEffectiveSettings(activeChat);
    setTabName(defaultSettings.name);
    setSystemPrompt(defaultSettings.prompt);
    toast({
      title: "↩️ Settings Reset",
      description: "This tab has been reset to its default settings.",
      duration: 3000,
    });
  };

  const handleConfirmClearHistory = () => {
    clearChatHistory();
    toast({
      title: "🗑️ Chat History Cleared",
      description: "The conversation has been permanently deleted.",
      duration: 3000,
    });
    setIsAlertOpen(false);
    onClose();
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemPrompt(e.target.value);
  };

  const noHoverTransform = "transition-none hover:transform-none active:transform-none";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage settings for the "{getEffectiveSettings(activeChat).name}" chat.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0 px-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto border-b rounded-none">
              <TabsTrigger
                value="general"
                className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="prompt"
                className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                System Prompt
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 min-h-[320px] overflow-hidden">
              <TabsContent
                value="general"
                className="h-full data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-0"
              >
                <div className="space-y-8 pt-2 pr-1">
                  <div className="space-y-2">
                    <Label htmlFor="tab-name">Tab Name</Label>
                    <Input
                      id="tab-name"
                      value={tabName}
                      onChange={(e) => setTabName(e.target.value)}
                      placeholder="e.g., Glitch, My Custom Chat"
                    />
                  </div>
                  <div className="space-y-4 rounded-lg border border-destructive/50 p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground">
                        This action is permanent and cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setIsAlertOpen(true)}
                      className={noHoverTransform}
                    >
                      Clear Chat History
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* System Prompt Tab */}
              <TabsContent
                value="prompt"
                className="h-full flex flex-col space-y-2 data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-0"
              >
                <Label htmlFor="system-prompt" className="pt-2">
                  Prompt
                </Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={handlePromptChange}
                  placeholder="Enter the system prompt for the AI..."
                  className="flex-1 resize-none text-xs font-mono"
                />
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t mt-4 flex-row justify-between items-center">
            <Button variant="ghost" onClick={handleReset} className={noHoverTransform}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" className={noHoverTransform}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave} className={noHoverTransform}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Clearing History */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the entire chat history for the "
              {getEffectiveSettings(activeChat).name}" tab. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={noHoverTransform}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearHistory} className={noHoverTransform}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
