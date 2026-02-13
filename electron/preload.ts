import { contextBridge, ipcRenderer } from 'electron';
import type { PersistedConfig } from '../src/types';
import { IPC_CHANNELS } from './ipc/channels';

const electronAPI = {
  window: {
    toggleOverlay: async (): Promise<boolean> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.WINDOW.TOGGLE_OVERLAY);
    },
    setOpacity: async (value: number): Promise<void> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_OPACITY, value);
    },
    setAlwaysOnTop: async (enabled: boolean): Promise<void> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_ALWAYS_ON_TOP, enabled);
    },
    setClickThrough: async (enabled: boolean): Promise<void> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_CLICK_THROUGH, enabled);
    },
  },
  hotkey: {
    onHotkeyEvent: (callback: (action: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, action: string) => {
        callback(action);
      };
      ipcRenderer.on(IPC_CHANNELS.HOTKEY.EVENT, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.HOTKEY.EVENT, listener);
      };
    },
  },
  config: {
    getConfig: async (): Promise<PersistedConfig> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.CONFIG.GET);
    },
    setConfig: async (config: PersistedConfig): Promise<void> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.CONFIG.SET, config);
    },
  },
  app: {
    getVersion: async (): Promise<string> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.APP.GET_VERSION);
    },
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
