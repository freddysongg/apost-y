import { Tray, Menu, BrowserWindow, app } from 'electron';
import * as path from 'path';

export class TrayManager {
  private tray: Tray | null = null;
  private window: BrowserWindow;
  private isMuted: boolean = false;
  private isOverlay: boolean = false;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  create(): Tray {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');

    this.tray = new Tray(iconPath);

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
          this.window.webContents.send('mute:changed', this.isMuted);
        },
      },
      {
        label: this.isOverlay ? 'Exit Overlay Mode' : 'Enter Overlay Mode',
        click: () => {
          this.isOverlay = !this.isOverlay;
          this.window.webContents.send('overlay:toggled', this.isOverlay);
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
    this.updateMenu();
  }

  setOverlay(overlay: boolean): void {
    this.isOverlay = overlay;
    this.updateMenu();
  }

  private updateMenu(): void {
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
          this.window.webContents.send('mute:changed', this.isMuted);
        },
      },
      {
        label: this.isOverlay ? 'Exit Overlay Mode' : 'Enter Overlay Mode',
        click: () => {
          this.isOverlay = !this.isOverlay;
          this.window.webContents.send('overlay:toggled', this.isOverlay);
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
