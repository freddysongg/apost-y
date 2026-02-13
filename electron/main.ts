import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { WindowManager } from './managers/WindowManager';
import { GlobalHotkeyManager } from './managers/GlobalHotkeyManager';
import { TrayManager } from './managers/TrayManager';
import { StoreManager } from './managers/StoreManager';
import { IPC_CHANNELS } from './ipc/channels';
import type { PersistedConfig } from '../src/types';

let mainWindow: BrowserWindow;
let windowManager: WindowManager;
let hotkeyManager: GlobalHotkeyManager;
let trayManager: TrayManager;
let storeManager: StoreManager;

const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  if (isDev && VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    hotkeyManager.cleanup();
    trayManager.destroy();
    app.quit();
  });

  windowManager = new WindowManager(mainWindow);
  hotkeyManager = new GlobalHotkeyManager(mainWindow);
  trayManager = new TrayManager(mainWindow);
  storeManager = new StoreManager();

  const config = storeManager.getConfig();
  hotkeyManager.registerAll(config.keybinds);
  trayManager.create();

  setupIPCHandlers();
}

function setupIPCHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW.TOGGLE_OVERLAY, async () => {
    return windowManager.toggleOverlay();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_OPACITY, async (_event, value: number) => {
    windowManager.setOpacity(value);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_ALWAYS_ON_TOP, async (_event, enabled: boolean) => {
    windowManager.setAlwaysOnTop(enabled);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_CLICK_THROUGH, async (_event, enabled: boolean) => {
    windowManager.setClickThrough(enabled);
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG.GET, async () => {
    return storeManager.getConfig();
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG.SET, async (_event, config: PersistedConfig) => {
    storeManager.setConfig(config);
    hotkeyManager.updateKeybinds(config.keybinds);
  });

  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, async () => {
    return app.getVersion();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
