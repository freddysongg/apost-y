import { useState, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { audioCaptureService } from '@/services/AudioCaptureService';
import { ConnectionIndicator } from '@/components/shared/ConnectionIndicator';
import { Mic, MicOff, Monitor } from 'lucide-react';

export function StatusBar() {
  const connectionStatus = useSessionStore((s) => s.connectionStatus);
  const inputMode = useSessionStore((s) => s.inputMode);
  const isListening = useSessionStore((s) => s.isListening);
  const isMuted = useSessionStore((s) => s.isMuted);
  const keybinds = useSessionStore((s) => s.keybinds);

  const [micActive, setMicActive] = useState(false);
  const [sysActive, setSysActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMicActive(audioCaptureService.micActive);
      setSysActive(audioCaptureService.systemActive);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[hsl(var(--secondary))] border-t border-[hsl(var(--border))] text-xs">
      <ConnectionIndicator status={connectionStatus} />

      <div className="flex items-center gap-3">
        <span className="text-[hsl(var(--muted-foreground))]">
          {inputMode === 'vad' ? 'VAD' : 'PTT'}
        </span>

        {isListening && (
          <span className="text-green-400 animate-pulse">Listening</span>
        )}

        <div className="flex items-center gap-2">
          {isMuted ? (
            <MicOff className="h-3.5 w-3.5 text-red-400" />
          ) : micActive ? (
            <Mic className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Mic className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          )}
          {sysActive && (
            <Monitor className="h-3.5 w-3.5 text-blue-400" />
          )}
        </div>

        {inputMode === 'push-to-talk' && (
          <span className="text-[hsl(var(--muted-foreground))]">
            [{keybinds.pushToTalk}]
          </span>
        )}
      </div>
    </div>
  );
}
