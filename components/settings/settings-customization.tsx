"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsCustomizationProps {
  tabName: string;
  setTabName: (name: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

export function SettingsCustomization({
  tabName,
  setTabName,
  systemPrompt,
  setSystemPrompt,
}: SettingsCustomizationProps) {
  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="space-y-2">
        <Label htmlFor="tab-name">Tab Name</Label>
        <Input
          id="tab-name"
          value={tabName}
          onChange={(e) => setTabName(e.target.value)}
          placeholder="e.g., Glitch, My Custom Chat"
        />
      </div>
      <div className="space-y-2 flex-1 flex flex-col">
        <Label htmlFor="system-prompt">System Prompt</Label>
        <Textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="System prompt for the AI..."
          className="flex-1 resize-none text-xs font-mono"
        />
      </div>
    </div>
  );
}
