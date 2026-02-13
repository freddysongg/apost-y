import type { PersistedConfig } from '../types';

export class StoreManager {
  private store: Map<string, unknown>;

  constructor() {
    this.store = new Map();
  }

  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const value = this.store.get(key);
    return value !== undefined ? (value as T) : defaultValue;
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getConfig(): PersistedConfig {
    return this.get<PersistedConfig>('config') || this.getDefaultConfig();
  }

  setConfig(config: PersistedConfig): void {
    this.set('config', config);
  }

  private getDefaultConfig(): PersistedConfig {
    return {
      apiKey: null,
      keybinds: {
        pushToTalk: 'Space',
        toggleMute: 'KeyM',
        cancelResponse: 'Escape',
        clearConversation: 'KeyL',
        toggleOverlay: 'KeyO',
      },
      audioDeviceId: null,
      inputMode: 'vad',
      vadSettings: {
        threshold: 0.5,
        prefixPaddingMs: 300,
        silenceDurationMs: 500,
      },
      noteSets: [],
      activeNoteSetIds: [],
      ui: {
        fontSize: 14,
        opacity: 90,
        theme: 'dark',
      },
    };
  }
}
