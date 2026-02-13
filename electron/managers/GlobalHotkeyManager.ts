import { globalShortcut, BrowserWindow } from 'electron';
import type { KeybindConfig } from '../types';

export class GlobalHotkeyManager {
  private registeredShortcuts: string[] = [];
  private window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  registerAll(keybinds: KeybindConfig): void {
    this.unregisterAll();

    const keyboardShortcutMap: Record<string, string> = {
      Space: 'Space',
      KeyM: 'M',
      Escape: 'Esc',
      KeyL: 'L',
      KeyO: 'O',
    };

    const accelerators = [
      {
        key: keybinds.pushToTalk,
        action: 'pushToTalk',
        accelerator: `CmdOrCtrl+${keyboardShortcutMap[keybinds.pushToTalk] || keybinds.pushToTalk}`,
      },
      {
        key: keybinds.toggleMute,
        action: 'toggleMute',
        accelerator: `CmdOrCtrl+${keyboardShortcutMap[keybinds.toggleMute] || keybinds.toggleMute}`,
      },
      {
        key: keybinds.cancelResponse,
        action: 'cancelResponse',
        accelerator: `CmdOrCtrl+${keyboardShortcutMap[keybinds.cancelResponse] || keybinds.cancelResponse}`,
      },
      {
        key: keybinds.clearConversation,
        action: 'clearConversation',
        accelerator: `CmdOrCtrl+${keyboardShortcutMap[keybinds.clearConversation] || keybinds.clearConversation}`,
      },
      {
        key: keybinds.toggleOverlay,
        action: 'toggleOverlay',
        accelerator: `CmdOrCtrl+${keyboardShortcutMap[keybinds.toggleOverlay] || keybinds.toggleOverlay}`,
      },
    ];

    accelerators.forEach(({ accelerator, action }) => {
      try {
        const id = globalShortcut.register(accelerator, () => {
          this.window.webContents.send('hotkey:event', action);
        });

        if (id) {
          this.registeredShortcuts.push(accelerator);
        }
      } catch (error) {
        console.error(`Failed to register shortcut ${accelerator}:`, error);
      }
    });
  }

  unregisterAll(): void {
    this.registeredShortcuts.forEach((shortcut) => {
      globalShortcut.unregister(shortcut);
    });
    this.registeredShortcuts = [];
  }

  updateKeybinds(keybinds: KeybindConfig): void {
    this.registerAll(keybinds);
  }

  cleanup(): void {
    this.unregisterAll();
  }
}
