import { app, BrowserWindow, ipcMain, session, desktopCapturer, systemPreferences } from 'electron';
import * as path from 'path';
import { WindowManager } from './managers/WindowManager';
import { TrayManager } from './managers/TrayManager';
import { StoreManager } from './managers/StoreManager';
import { EmbeddedServer } from './services/EmbeddedServer';
import { IPC_CHANNELS } from './ipc/channels';
import type { PersistedConfig } from '../src/types';

let mainWindow: BrowserWindow | null = null;
let windowManager: WindowManager;
let trayManager: TrayManager;
let storeManager: StoreManager;
let embeddedServer: EmbeddedServer;

const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

async function createWindow(): Promise<void> {
  storeManager = new StoreManager();
  embeddedServer = new EmbeddedServer(storeManager);
  await embeddedServer.start();

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 14, y: 14 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev && VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupDisplayMediaHandler();

  windowManager = new WindowManager(mainWindow);
  trayManager = new TrayManager(mainWindow);
  trayManager.create();

  setupIPCHandlers();
}

function setupDisplayMediaHandler(): void {
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    const screenAccess = systemPreferences.getMediaAccessStatus('screen');
    if (screenAccess !== 'granted') {
      console.warn('Screen recording permission not granted. Current status:', screenAccess);
    }

    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      if (sources.length > 0) {
        callback({ video: sources[0], audio: 'loopback' });
      } else {
        console.warn('No screen sources found');
        callback({});
      }
    } catch (err) {
      console.error('Failed to get desktop sources:', err);
      console.error('Grant screen recording permission in System Settings > Privacy & Security > Screen Recording');
      callback({});
    }
  });
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
  });

  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, async () => {
    return app.getVersion();
  });

  ipcMain.handle(IPC_CHANNELS.SERVER.GET_PORT, async () => {
    return embeddedServer.getPort();
  });
}

app.on('ready', createWindow);

app.on('before-quit', async () => {
  trayManager?.destroy();
  await embeddedServer?.stop();
});

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
