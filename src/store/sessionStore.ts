import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptEntry, NoteSet, KeybindConfig, VADSettings, AudioInputConfig } from '@/types';
import { DEFAULT_KEYBINDS, DEFAULT_VAD_SETTINGS, DEFAULT_NOTE_SETS, SYSTEM_PROMPT_TEMPLATE } from '@/constants';

function loadPersistedConfig() {
  try {
    const raw = localStorage.getItem('persisted_config');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const persisted = loadPersistedConfig();

interface SessionState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  apiKey: string | null;
  isMuted: boolean;
  isListening: boolean;
  isPushToTalkActive: boolean;
  inputMode: 'vad' | 'push-to-talk';
  selectedDeviceId: string | null;
  transcript: TranscriptEntry[];
  currentAnswer: string;
  isAnswering: boolean;
  noteSets: NoteSet[];
  activeNoteSetIds: string[];
  appMode: 'overlay' | 'full';
  activePanel: 'transcript' | 'settings' | 'notes';
  fontSize: number;
  opacity: number;
  theme: 'dark' | 'light';
  keybinds: KeybindConfig;
  isRecordingKeybind: boolean;
  recordingAction: string | null;
  vadSettings: VADSettings;
  systemPrompt: string;
  audioInput: AudioInputConfig;
  transcriptHeight: number;

  setApiKey: (key: string | null) => void;
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
  toggleMute: () => void;
  setIsListening: (listening: boolean) => void;
  setInputMode: (mode: 'vad' | 'push-to-talk') => void;
  setPushToTalkActive: (active: boolean) => void;
  setSelectedDeviceId: (id: string | null) => void;
  appendTranscript: (entry: TranscriptEntry) => void;
  appendAnswerDelta: (delta: string) => void;
  finalizeAnswer: () => void;
  clearConversation: () => void;
  addNoteSet: (name: string, content: string) => void;
  setNoteSets: (noteSets: NoteSet[]) => void;
  toggleNoteSet: (id: string) => void;
  updateNoteSet: (id: string, updates: Partial<NoteSet>) => void;
  deleteNoteSet: (id: string) => void;
  toggleAppMode: () => void;
  setActivePanel: (panel: 'transcript' | 'settings' | 'notes') => void;
  setFontSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setKeybinds: (keybinds: KeybindConfig) => void;
  setRecordingKeybind: (recording: boolean, action: string | null) => void;
  setVadSettings: (settings: VADSettings) => void;
  setSystemPrompt: (prompt: string) => void;
  setAudioInput: (config: Partial<AudioInputConfig>) => void;
  setTranscriptHeight: (height: number) => void;
}

const defaultNoteSets = persisted?.noteSets ?? DEFAULT_NOTE_SETS;

export const useSessionStore = create<SessionState>((set) => ({
  connectionStatus: 'disconnected',
  apiKey: persisted?.apiKey ?? null,
  isMuted: false,
  isListening: false,
  isPushToTalkActive: false,
  inputMode: persisted?.inputMode ?? 'vad',
  selectedDeviceId: persisted?.audioDeviceId ?? null,
  transcript: [],
  currentAnswer: '',
  isAnswering: false,
  noteSets: defaultNoteSets,
  activeNoteSetIds: persisted?.activeNoteSetIds ?? defaultNoteSets.map((ns: NoteSet) => ns.id),
  appMode: 'full',
  activePanel: 'transcript',
  fontSize: persisted?.ui?.fontSize ?? 16,
  opacity: persisted?.ui?.opacity ?? 1.0,
  theme: persisted?.ui?.theme ?? 'dark',
  keybinds: persisted?.keybinds ?? DEFAULT_KEYBINDS,
  isRecordingKeybind: false,
  recordingAction: null,
  vadSettings: persisted?.vadSettings ?? DEFAULT_VAD_SETTINGS,
  systemPrompt: persisted?.systemPrompt ?? SYSTEM_PROMPT_TEMPLATE,
  audioInput: persisted?.audioInput ?? {
    micEnabled: true,
    micDeviceId: null,
    systemAudioEnabled: false,
  },
  transcriptHeight: persisted?.transcriptHeight ?? 150,

  setApiKey: (key) => set({ apiKey: key }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setIsListening: (listening) => set({ isListening: listening }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setPushToTalkActive: (active) => set({ isPushToTalkActive: active }),
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),

  appendTranscript: (entry) => set((state) => ({ transcript: [...state.transcript, entry] })),
  appendAnswerDelta: (delta) => set((state) => ({
    currentAnswer: state.currentAnswer + delta,
    isAnswering: true,
  })),
  finalizeAnswer: () => set((state) => {
    if (!state.currentAnswer) return state;
    const entry: TranscriptEntry = {
      id: uuidv4(),
      role: 'assistant',
      content: state.currentAnswer,
      timestamp: Date.now(),
    };
    return {
      transcript: [...state.transcript, entry],
      currentAnswer: '',
      isAnswering: false,
    };
  }),
  clearConversation: () => set({ transcript: [], currentAnswer: '', isAnswering: false }),

  addNoteSet: (name, content) => set((state) => ({
    noteSets: [...state.noteSets, {
      id: uuidv4(),
      name,
      content,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }],
  })),
  setNoteSets: (noteSets) => set({ noteSets }),
  toggleNoteSet: (id) => set((state) => ({
    activeNoteSetIds: state.activeNoteSetIds.includes(id)
      ? state.activeNoteSetIds.filter((nid) => nid !== id)
      : [...state.activeNoteSetIds, id],
  })),
  updateNoteSet: (id, updates) => set((state) => ({
    noteSets: state.noteSets.map((ns) =>
      ns.id === id ? { ...ns, ...updates, updatedAt: Date.now() } : ns
    ),
  })),
  deleteNoteSet: (id) => set((state) => ({
    noteSets: state.noteSets.filter((ns) => ns.id !== id),
    activeNoteSetIds: state.activeNoteSetIds.filter((nid) => nid !== id),
  })),

  toggleAppMode: () => set((state) => ({
    appMode: state.appMode === 'full' ? 'overlay' : 'full',
  })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setFontSize: (size) => set({ fontSize: size }),
  setOpacity: (opacity) => set({ opacity }),
  setTheme: (theme) => set({ theme }),
  setKeybinds: (keybinds) => set({ keybinds }),
  setRecordingKeybind: (recording, action) => set({
    isRecordingKeybind: recording,
    recordingAction: action,
  }),
  setVadSettings: (settings) => set({ vadSettings: settings }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setAudioInput: (config) => set((state) => ({
    audioInput: { ...state.audioInput, ...config },
  })),
  setTranscriptHeight: (height) => set({ transcriptHeight: height }),
}));

useSessionStore.subscribe((state) => {
  try {
    const config = {
      apiKey: state.apiKey,
      keybinds: state.keybinds,
      audioDeviceId: state.selectedDeviceId,
      inputMode: state.inputMode,
      vadSettings: state.vadSettings,
      noteSets: state.noteSets,
      activeNoteSetIds: state.activeNoteSetIds,
      systemPrompt: state.systemPrompt,
      audioInput: state.audioInput,
      transcriptHeight: state.transcriptHeight,
      ui: {
        fontSize: state.fontSize,
        opacity: state.opacity,
        theme: state.theme,
      },
    };
    localStorage.setItem('persisted_config', JSON.stringify(config));
  } catch {}
});
