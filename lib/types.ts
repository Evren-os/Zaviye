export type ChatType = "glitch" | "blame" | "reson";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
}

export interface SystemPrompts {
  glitch: string;
  blame: string;
  reson: string;
}

export interface IntroMessages {
  glitch: string;
  blame: string;
  reson: string;
}

export interface TabDescriptions {
  glitch: string;
  blame: string;
  reson: string;
}

export interface ChatSettings {
  name: string;
  prompt: string;
}

export type AllChatSettings = Record<ChatType, ChatSettings>;
