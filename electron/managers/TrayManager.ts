import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron';
import * as path from 'path';
import { IPC_CHANNELS } from '../ipc/channels';

export class TrayManager {
  private tray: Tray | null = null;
  private window: BrowserWindow;
  private isMuted: boolean = false;
  private isOverlay: boolean = false;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  create(): Tray {
    const iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'icon.png')
      : path.join(app.getAppPath(), 'build-resources', 'icon.png');

    let trayIcon: Electron.NativeImage;
    try {
      trayIcon = nativeImage.createFromPath(iconPath);
    } catch {
      trayIcon = nativeImage.createEmpty();
    }

    this.tray = new Tray(trayIcon);
    this.buildMenu();

    this.tray.on('click', () => {
      if (this.window.isVisible()) {
        this.window.hide();
      } else {
        this.window.show();
      }
    });

    return this.tray;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.buildMenu();
  }

  setOverlay(overlay: boolean): void {
    this.isOverlay = overlay;
    this.buildMenu();
  }

  private buildMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          this.window.show();
        },
      },
      {
        label: 'Hide',
        click: () => {
          this.window.hide();
        },
      },
      { type: 'separator' },
      {
        label: this.isMuted ? 'Unmute' : 'Mute',
        click: () => {
          this.isMuted = !this.isMuted;
          this.window.webContents.send(IPC_CHANNELS.TRAY.MUTE_CHANGED, this.isMuted);
          this.buildMenu();
        },
      },
      {
        label: this.isOverlay ? 'Exit Overlay Mode' : 'Enter Overlay Mode',
        click: () => {
          this.isOverlay = !this.isOverlay;
          this.window.webContents.send(IPC_CHANNELS.TRAY.OVERLAY_TOGGLED, this.isOverlay);
          this.buildMenu();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
