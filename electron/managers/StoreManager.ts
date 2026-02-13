import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { PersistedConfig } from '../../src/types';

const CONFIG_FILENAME = 'config.json';

export class StoreManager {
  private configPath: string;
  private config: PersistedConfig;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), CONFIG_FILENAME);
    this.config = this.readFromDisk();
  }

  getConfig(): PersistedConfig {
    return this.config;
  }

  setConfig(config: PersistedConfig): void {
    this.config = config;
    this.writeToDisk(config);
  }

  private readFromDisk(): PersistedConfig {
    try {
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const defaults = this.getDefaultConfig();
        const merged = { ...defaults, ...(parsed as Record<string, unknown>) } as PersistedConfig;
        merged.keybinds = { ...defaults.keybinds, ...merged.keybinds };
        merged.vadSettings = { ...defaults.vadSettings, ...merged.vadSettings };
        merged.audioInput = { ...defaults.audioInput, ...merged.audioInput };
        merged.ui = { ...defaults.ui, ...merged.ui };
        return merged;
      }
    } catch {
      // File missing or corrupt — use defaults
    }
    const defaults = this.getDefaultConfig();
    this.writeToDisk(defaults);
    return defaults;
  }

  private writeToDisk(config: PersistedConfig): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = this.configPath + '.tmp';
      fs.writeFileSync(tmpPath, JSON.stringify(config, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.configPath);
    } catch (err) {
      console.error('Failed to write config to disk:', err);
    }
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
        toggleSystemAudio: 'KeyS',
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
      systemPrompt: '',
      audioInput: {
        micEnabled: true,
        micDeviceId: null,
        systemAudioEnabled: false,
      },
      transcriptHeight: 150,
    };
  }
}
