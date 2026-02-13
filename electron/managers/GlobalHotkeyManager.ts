import { globalShortcut, BrowserWindow } from 'electron';
import type { KeybindConfig } from '../../src/types';
import { IPC_CHANNELS } from '../ipc/channels';

const KEY_CODE_TO_ACCELERATOR: Record<string, string> = {
  Space: 'Space',
  Escape: 'Esc',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Tab: 'Tab',
  Enter: 'Return',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
};

const MODIFIER_MAP: Record<string, string> = {
  Ctrl: 'CmdOrCtrl',
  Cmd: 'CmdOrCtrl',
  Control: 'CmdOrCtrl',
  Meta: 'CmdOrCtrl',
  Shift: 'Shift',
  Alt: 'Alt',
  Option: 'Alt',
};

function keybindToAccelerator(keybind: string): string {
  const parts = keybind.split('+');
  const modifiers: string[] = [];
  let key = '';

  for (const part of parts) {
    const mappedModifier = MODIFIER_MAP[part];
    if (mappedModifier) {
      if (!modifiers.includes(mappedModifier)) {
        modifiers.push(mappedModifier);
      }
    } else {
      key = part;
    }
  }

  if (key.startsWith('Key')) {
    key = key.slice(3);
  } else if (key.startsWith('Digit')) {
    key = key.slice(5);
  } else if (KEY_CODE_TO_ACCELERATOR[key]) {
    key = KEY_CODE_TO_ACCELERATOR[key];
  }

  // Bare key codes without modifiers need a default modifier for globalShortcut
  if (modifiers.length === 0) {
    modifiers.push('CmdOrCtrl', 'Shift');
  }

  return [...modifiers, key].join('+');
}

export class GlobalHotkeyManager {
  private registeredShortcuts: string[] = [];
  private window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  registerAll(keybinds: KeybindConfig): void {
    this.unregisterAll();

    const actions: Array<{ action: string; keybind: string }> = [
      { action: 'pushToTalk', keybind: keybinds.pushToTalk },
      { action: 'toggleMute', keybind: keybinds.toggleMute },
      { action: 'cancelResponse', keybind: keybinds.cancelResponse },
      { action: 'clearConversation', keybind: keybinds.clearConversation },
      { action: 'toggleOverlay', keybind: keybinds.toggleOverlay },
      { action: 'toggleSystemAudio', keybind: keybinds.toggleSystemAudio },
    ];

    for (const { action, keybind } of actions) {
      const accelerator = keybindToAccelerator(keybind);
      try {
        const registered = globalShortcut.register(accelerator, () => {
          this.window.webContents.send(IPC_CHANNELS.HOTKEY.EVENT, action);
        });

        if (registered) {
          this.registeredShortcuts.push(accelerator);
          console.log(`Global shortcut registered: ${accelerator} → ${action}`);
        } else {
          console.warn(`Global shortcut already in use: ${accelerator} → ${action}`);
        }
      } catch (error) {
        console.error(`Failed to register global shortcut ${accelerator} → ${action}:`, error);
      }
    }
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
