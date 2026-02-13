import { contextBridge, ipcRenderer } from 'electron';

/**
 * Channel strings are inlined here because Electron's sandboxed preload
 * cannot require() custom modules — only built-in Node/Electron modules.
 * These must stay in sync with electron/ipc/channels.ts.
 */
const electronAPI = {
  window: {
    toggleOverlay: async (): Promise<boolean> => {
      return await ipcRenderer.invoke('window:toggle-overlay');
    },
    setOpacity: async (value: number): Promise<void> => {
      return await ipcRenderer.invoke('window:set-opacity', value);
    },
    setAlwaysOnTop: async (enabled: boolean): Promise<void> => {
      return await ipcRenderer.invoke('window:set-always-on-top', enabled);
    },
    setClickThrough: async (enabled: boolean): Promise<void> => {
      return await ipcRenderer.invoke('window:set-click-through', enabled);
    },
  },
  hotkey: {
    onHotkeyEvent: (callback: (action: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, action: string): void => {
        callback(action);
      };
      ipcRenderer.on('hotkey:event', listener);
      return (): void => {
        ipcRenderer.removeListener('hotkey:event', listener);
      };
    },
  },
  config: {
    getConfig: async (): Promise<unknown> => {
      return await ipcRenderer.invoke('config:get');
    },
    setConfig: async (config: unknown): Promise<void> => {
      return await ipcRenderer.invoke('config:set', config);
    },
  },
  app: {
    getVersion: async (): Promise<string> => {
      return await ipcRenderer.invoke('app:get-version');
    },
  },
  server: {
    getPort: async (): Promise<number> => {
      return await ipcRenderer.invoke('server:get-port');
    },
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
