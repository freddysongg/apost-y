export interface NoteSet {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface KeybindConfig {
  pushToTalk: string;
  toggleMute: string;
  cancelResponse: string;
  clearConversation: string;
  toggleOverlay: string;
}

export interface VADSettings {
  threshold: number;
  prefixPaddingMs: number;
  silenceDurationMs: number;
}

export interface UIConfig {
  fontSize: number;
  opacity: number;
  theme: 'dark' | 'light';
}

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AudioInputConfig {
  micEnabled: boolean;
  micDeviceId: string | null;
  systemAudioEnabled: boolean;
}

export interface PersistedConfig {
  apiKey: string | null;
  keybinds: KeybindConfig;
  audioDeviceId: string | null;
  inputMode: 'vad' | 'push-to-talk';
  vadSettings: VADSettings;
  noteSets: NoteSet[];
  activeNoteSetIds: string[];
  ui: UIConfig;
  systemPrompt: string;
  audioInput: AudioInputConfig;
  transcriptHeight: number;
}
