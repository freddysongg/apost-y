import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { keybindService } from '@/services/KeybindService';
import { audioCaptureService } from '@/services/AudioCaptureService';

export function useHotkeys(): void {
  const keybinds = useSessionStore(s => s.keybinds);
  const toggleMute = useSessionStore(s => s.toggleMute);
  const clearConversation = useSessionStore(s => s.clearConversation);
  const toggleAppMode = useSessionStore(s => s.toggleAppMode);
  const setPushToTalkActive = useSessionStore(s => s.setPushToTalkActive);
  const setAudioInput = useSessionStore(s => s.setAudioInput);
  const inputMode = useSessionStore(s => s.inputMode);
  const isPushToTalkActive = useSessionStore(s => s.isPushToTalkActive);

  useEffect(() => {
    const toggleSystemAudio = (): void => {
      const { audioInput } = useSessionStore.getState();
      if (audioInput.systemAudioEnabled) {
        audioCaptureService.stopSystemAudio();
        setAudioInput({ systemAudioEnabled: false });
      } else {
        audioCaptureService.startSystemAudio().then(() => {
          setAudioInput({ systemAudioEnabled: true });
        }).catch((err: unknown) => {
          console.error('Failed to start system audio:', err);
        });
      }
    };

    const handlers: Record<string, () => void> = {
      toggleMute,
      clearConversation,
      toggleOverlay: toggleAppMode,
      toggleSystemAudio,
      pushToTalk: () => {
        if (inputMode === 'push-to-talk') {
          setPushToTalkActive(true);
        }
      },
    };

    keybindService.registerBrowserKeybinds(keybinds, handlers);

    const handleKeyUp = (e: KeyboardEvent): void => {
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
  }, [keybinds, inputMode, isPushToTalkActive, toggleMute, clearConversation, toggleAppMode, setPushToTalkActive, setAudioInput]);
}
