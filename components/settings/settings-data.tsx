"use client";

import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SettingsDataProps {
  clearChatHistory: () => void;
  onClose: () => void;
}

const SettingItem = ({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) => (
  <div className="flex items-start justify-between rounded-lg p-4 transition-colors hover:bg-muted/50">
    <div className="space-y-1 pr-4">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

export function SettingsData({ clearChatHistory, onClose }: SettingsDataProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

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
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <SettingItem
            title="Delete All Conversations"
            description="Permanently delete all of your conversation data for the current chat tab. This action is immediate and cannot be undone."
            control={
              <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
                Delete
              </Button>
            }
          />
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will wipe the whole chat history for this tab. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearHistory}>Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
