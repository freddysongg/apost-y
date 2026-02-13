import type { PersistedConfig } from '@/types';

function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

export function useElectronAPI() {
  const isElectron = isElectronEnvironment();

  return {
    isElectron,
    window: {
      toggleOverlay: (): Promise<boolean> | undefined =>
        window.electronAPI?.window.toggleOverlay(),
      setOpacity: (value: number): Promise<void> | undefined =>
        window.electronAPI?.window.setOpacity(value),
      setAlwaysOnTop: (enabled: boolean): Promise<void> | undefined =>
        window.electronAPI?.window.setAlwaysOnTop(enabled),
      setClickThrough: (enabled: boolean): Promise<void> | undefined =>
        window.electronAPI?.window.setClickThrough(enabled),
    },
    hotkey: {
      onHotkeyEvent: (callback: (action: string) => void): (() => void) | undefined =>
        window.electronAPI?.hotkey.onHotkeyEvent(callback),
    },
    config: {
      getConfig: (): Promise<PersistedConfig> | undefined =>
        window.electronAPI?.config.getConfig(),
      setConfig: (config: PersistedConfig): Promise<void> | undefined =>
        window.electronAPI?.config.setConfig(config),
    },
    app: {
      getVersion: (): Promise<string> =>
        window.electronAPI?.app.getVersion() ?? Promise.resolve('1.0.0-web'),
    },
    server: {
      getPort: (): Promise<number> | undefined =>
        window.electronAPI?.server.getPort(),
    },
  };
}
