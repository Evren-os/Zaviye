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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/use-settings";
import type { ChatType } from "@/lib/types";
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
  const { getEffectiveSettings, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();

  const [tabName, setTabName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("general");

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getEffectiveSettings(activeChat);
      setTabName(currentSettings.name);
      setSystemPrompt(currentSettings.prompt);
      setCurrentTab("general");
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage settings for the "{getEffectiveSettings(activeChat).name}" chat.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto rounded-none border-b px-6">
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

            {/* Key Change: Container now has fixed height and handles overflow. Padding is moved inside. */}
            <div className="h-[400px] overflow-y-auto">
              <TabsContent
                value="general"
                className="mt-0 h-full p-6 data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
              >
                <div className="space-y-6">
                  <Card>
                    {/* Key Change: Reduced padding for a more compact card */}
                    <CardHeader className="p-4">
                      <CardTitle>Display</CardTitle>
                      <CardDescription>Customize the name of this chat tab.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="tab-name">Tab Name</Label>
                        <Input
                          id="tab-name"
                          value={tabName}
                          onChange={(e) => setTabName(e.target.value)}
                          placeholder="e.g., Glitch, My Custom Chat"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive">
                    <CardHeader className="p-4">
                      <CardTitle>Danger Zone</CardTitle>
                      <CardDescription>
                        This action is permanent and cannot be undone.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Button
                        variant="destructive"
                        onClick={() => setIsAlertOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        Delete Chat History
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="prompt"
                className="mt-0 h-full flex flex-col space-y-2 p-6 data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
              >
                <Label htmlFor="system-prompt">Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt for the AI..."
                  className="flex-1 resize-none text-xs font-mono"
                />
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-6 border-t flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
            <Button variant="ghost" onClick={handleReset} className="w-full sm:w-auto">
              Reset to Default
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearHistory}>
              Yes, Delete History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
