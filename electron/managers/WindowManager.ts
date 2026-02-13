import { BrowserWindow } from 'electron';

export class WindowManager {
  private window: BrowserWindow;
  private isOverlayMode: boolean = false;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  toggleOverlay(): boolean {
    this.isOverlayMode = !this.isOverlayMode;

    if (this.isOverlayMode) {
      this.window.setAlwaysOnTop(true, 'floating');
      this.window.setSkipTaskbar(true);
    } else {
      this.window.setAlwaysOnTop(false);
      this.window.setSkipTaskbar(false);
    }

    return this.isOverlayMode;
  }

  setOpacity(value: number): void {
    const opacity = Math.max(0, Math.min(1, value / 100));
    this.window.setOpacity(opacity);
  }

  setAlwaysOnTop(enabled: boolean): void {
    if (enabled) {
      this.window.setAlwaysOnTop(true, 'floating');
    } else {
      this.window.setAlwaysOnTop(false);
    }
  }

  setClickThrough(enabled: boolean): void {
    if (process.platform === 'win32') {
      this.window.setIgnoreMouseEvents(enabled);
    }
  }

  getWindow(): BrowserWindow {
    return this.window;
  }

  isOverlay(): boolean {
    return this.isOverlayMode;
  }
}
