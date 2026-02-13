import type { PersistedConfig } from './index';

interface ElectronWindowAPI {
  toggleOverlay: () => Promise<boolean>;
  setOpacity: (value: number) => Promise<void>;
  setAlwaysOnTop: (enabled: boolean) => Promise<void>;
  setClickThrough: (enabled: boolean) => Promise<void>;
}

interface ElectronHotkeyAPI {
  onHotkeyEvent: (callback: (action: string) => void) => () => void;
}

interface ElectronConfigAPI {
  getConfig: () => Promise<PersistedConfig>;
  setConfig: (config: PersistedConfig) => Promise<void>;
}

interface ElectronAppAPI {
  getVersion: () => Promise<string>;
}

interface ElectronServerAPI {
  getPort: () => Promise<number>;
}

interface ElectronAPI {
  window: ElectronWindowAPI;
  hotkey: ElectronHotkeyAPI;
  config: ElectronConfigAPI;
  app: ElectronAppAPI;
  server: ElectronServerAPI;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export type { ElectronAPI };
