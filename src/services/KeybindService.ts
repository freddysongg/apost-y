import type { KeybindConfig } from '@/types';

export class KeybindService {
  private listeners = new Map<string, (e: KeyboardEvent) => void>();
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;

  registerBrowserKeybinds(keybinds: KeybindConfig, handlers: Record<string, Function>): void {
    this.unregisterAll();

    this.boundHandler = (e: KeyboardEvent) => {
      for (const [action, accelerator] of Object.entries(keybinds)) {
        const parsed = this.parseAccelerator(accelerator);
        if (
          e.ctrlKey === parsed.ctrlKey &&
          e.shiftKey === parsed.shiftKey &&
          e.altKey === parsed.altKey &&
          e.metaKey === parsed.metaKey &&
          e.code === parsed.key
        ) {
          e.preventDefault();
          handlers[action]?.();
          return;
        }
      }
    };

    window.addEventListener('keydown', this.boundHandler);
  }

  unregisterAll(): void {
    if (this.boundHandler) {
      window.removeEventListener('keydown', this.boundHandler);
      this.boundHandler = null;
    }
    this.listeners.clear();
  }

  parseAccelerator(accelerator: string): {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    key: string;
  } {
    const parts = accelerator.split('+');
    const result = {
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: '',
    };

    for (const part of parts) {
      const lower = part.trim().toLowerCase();
      if (lower === 'ctrl' || lower === 'control') {
        result.ctrlKey = true;
      } else if (lower === 'shift') {
        result.shiftKey = true;
      } else if (lower === 'alt') {
        result.altKey = true;
      } else if (lower === 'meta' || lower === 'cmd' || lower === 'command') {
        result.metaKey = true;
      } else {
        result.key = part.trim();
      }
    }

    return result;
  }

  formatKeybind(accelerator: string): string {
    const parsed = this.parseAccelerator(accelerator);
    const parts: string[] = [];
    if (parsed.ctrlKey) parts.push('Ctrl');
    if (parsed.shiftKey) parts.push('Shift');
    if (parsed.altKey) parts.push('Alt');
    if (parsed.metaKey) parts.push('Cmd');

    let keyName = parsed.key;
    if (keyName.startsWith('Key')) {
      keyName = keyName.slice(3);
    } else if (keyName === 'Space') {
      keyName = 'Space';
    } else if (keyName.startsWith('Digit')) {
      keyName = keyName.slice(5);
    }
    parts.push(keyName);

    return parts.join(' + ');
  }

  isElectron(): boolean {
    return !!(window as any).electronAPI;
  }
}

export const keybindService = new KeybindService();
