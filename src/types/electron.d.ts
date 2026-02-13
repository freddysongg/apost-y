export interface ElectronAPI {
  getConfig: () => Promise<import('./index').PersistedConfig>;
  setConfig: (config: import('./index').PersistedConfig) => Promise<void>;
  onKeybind: (callback: (action: string) => void) => void;
  removeKeybindListeners: () => void;
  setOverlayMode: (enabled: boolean) => void;
  getAudioDevices: () => Promise<MediaDeviceInfo[]>;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
