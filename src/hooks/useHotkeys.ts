import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { keybindService } from '@/services/KeybindService';

export function useHotkeys() {
  const keybinds = useSessionStore(s => s.keybinds);
  const toggleMute = useSessionStore(s => s.toggleMute);
  const clearConversation = useSessionStore(s => s.clearConversation);
  const toggleAppMode = useSessionStore(s => s.toggleAppMode);
  const setPushToTalkActive = useSessionStore(s => s.setPushToTalkActive);
  const inputMode = useSessionStore(s => s.inputMode);

  useEffect(() => {
    if (keybindService.isElectron()) return;

    const handlers: Record<string, Function> = {
      toggleMute,
      clearConversation,
      toggleOverlay: toggleAppMode,
      pushToTalk: () => {
        if (inputMode === 'push-to-talk') {
          setPushToTalkActive(true);
        }
      },
    };

    keybindService.registerBrowserKeybinds(keybinds, handlers);

    const handleKeyUp = (e: KeyboardEvent) => {
      if (inputMode === 'push-to-talk') {
        const parsed = keybindService.parseAccelerator(keybinds.pushToTalk);
        if (parsed && e.code === parsed.key) {
          setPushToTalkActive(false);
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      keybindService.unregisterAll();
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keybinds, inputMode, toggleMute, clearConversation, toggleAppMode, setPushToTalkActive]);
}
