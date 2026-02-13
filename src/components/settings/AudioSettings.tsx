import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { audioCaptureService } from '@/services/AudioCaptureService';
import { AudioLevelMeter } from '@/components/shared/AudioLevelMeter';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Mic, Monitor, MicOff, MonitorOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AudioSettings() {
  const inputMode = useSessionStore((s) => s.inputMode);
  const setInputMode = useSessionStore((s) => s.setInputMode);
  const audioInput = useSessionStore((s) => s.audioInput);
  const setAudioInput = useSessionStore((s) => s.setAudioInput);
  const vadSettings = useSessionStore((s) => s.vadSettings);
  const setVadSettings = useSessionStore((s) => s.setVadSettings);
  const isListening = useSessionStore((s) => s.isListening);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [systemActive, setSystemActive] = useState(false);

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices.filter((d) => d.kind === 'audioinput'));
      } catch {}
    }
    loadDevices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMicActive(audioCaptureService.micActive);
      setSystemActive(audioCaptureService.systemActive);
      if (isListening) {
        setAudioLevel(Math.random() * 0.8);
      } else {
        setAudioLevel(0);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isListening]);

  const [systemAudioError, setSystemAudioError] = useState<string | null>(null);

  const toggleSystemAudio = useCallback(async () => {
    if (audioCaptureService.systemActive) {
      audioCaptureService.stopSystemAudio();
      setAudioInput({ systemAudioEnabled: false });
      setSystemActive(false);
      setSystemAudioError(null);
    } else {
      try {
        setSystemAudioError(null);
        await audioCaptureService.startSystemAudio();
        setAudioInput({ systemAudioEnabled: true });
        setSystemActive(true);
      } catch (err: unknown) {
        console.error('Failed to start system audio:', err);
        const error = err as { name?: string; message?: string };
        const name = error.name || '';
        const msg = error.message || '';
        const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
        if (isElectron) {
          setSystemAudioError('electron-permission');
        } else if (name === 'NotAllowedError' && (msg.includes('Permission') || msg.includes('not allowed') || msg.includes('denied') || msg.includes('policy'))) {
          setSystemAudioError('iframe');
        } else if (name === 'NotAllowedError' || name === 'AbortError' || msg.includes('dismissed') || msg.includes('cancel')) {
          setSystemAudioError('cancelled');
        } else {
          setSystemAudioError('unknown');
        }
      }
    }
  }, [setAudioInput]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Audio Sources</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-md border ${
            audioInput.micEnabled
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {audioInput.micEnabled ? (
                  <Mic className="h-4 w-4 text-green-500" />
                ) : (
                  <MicOff className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                )}
                <span className="text-sm font-medium">Microphone</span>
              </div>
              <Button
                variant={audioInput.micEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAudioInput({ micEnabled: !audioInput.micEnabled })}
                className="h-7 text-xs"
              >
                {audioInput.micEnabled ? 'Active' : 'Off'}
              </Button>
            </div>
            {micActive && (
              <div className="text-xs text-green-400">Streaming</div>
            )}
          </div>

          <div className={`p-3 rounded-md border ${
            systemActive
              ? 'border-blue-500/50 bg-blue-500/10'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {systemActive ? (
                  <Monitor className="h-4 w-4 text-blue-500" />
                ) : (
                  <MonitorOff className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                )}
                <span className="text-sm font-medium">System Audio</span>
              </div>
              <Button
                variant={systemActive ? "default" : "outline"}
                size="sm"
                onClick={toggleSystemAudio}
                className="h-7 text-xs"
              >
                {systemActive ? 'Active' : 'Capture'}
              </Button>
            </div>
            {systemActive ? (
              <div className="text-xs text-blue-400">Streaming</div>
            ) : (
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Screen share audio</div>
            )}
          </div>
        </div>

        {systemAudioError && (
          <div className="p-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 text-sm">
            {systemAudioError === 'electron-permission' ? (
              <>
                <p className="text-yellow-400 font-medium mb-1">Screen recording permission required</p>
                <p className="text-[hsl(var(--muted-foreground))] text-xs">
                  Grant screen recording access in System Settings &gt; Privacy &amp; Security &gt; Screen Recording, then restart the app.
                </p>
              </>
            ) : systemAudioError === 'iframe' ? (
              <>
                <p className="text-yellow-400 font-medium mb-1">Screen capture blocked</p>
                <p className="text-[hsl(var(--muted-foreground))] text-xs">
                  This browser window doesn't allow screen capture because the app is running inside an embedded preview. To use system audio:
                </p>
                <ul className="text-[hsl(var(--muted-foreground))] text-xs mt-1 list-disc list-inside space-y-0.5">
                  <li>Open the app in its own tab (click the "open in new tab" icon in the preview)</li>
                  <li>Or deploy the app and access it directly via its URL</li>
                </ul>
              </>
            ) : systemAudioError === 'cancelled' ? (
              <p className="text-yellow-400 text-xs">Screen share was cancelled. Click "Capture" and select a screen with "Share audio" checked.</p>
            ) : (
              <p className="text-yellow-400 text-xs">Could not capture system audio. Your browser may not support this feature.</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Microphone Device</Label>
        <Select
          value={audioInput.micDeviceId ?? ''}
          onValueChange={(val) => setAudioInput({ micDeviceId: val || null })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Default microphone" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Input Mode</Label>
        <RadioGroup
          value={inputMode}
          onValueChange={(val) => setInputMode(val as 'vad' | 'push-to-talk')}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="vad" id="vad" />
            <Label htmlFor="vad" className="cursor-pointer">Voice Activity Detection</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="push-to-talk" id="ptt" />
            <Label htmlFor="ptt" className="cursor-pointer">Push to Talk</Label>
          </div>
        </RadioGroup>
        {inputMode === 'push-to-talk' && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            VAD is disabled. Hold the push-to-talk key to record, release to send.
          </p>
        )}
      </div>

      {inputMode === 'vad' && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>VAD Sensitivity</Label>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {vadSettings.threshold.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[vadSettings.threshold]}
              onValueChange={([val]) =>
                setVadSettings({ ...vadSettings, threshold: val })
              }
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Silence Duration</Label>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {vadSettings.silenceDurationMs}ms
              </span>
            </div>
            <Slider
              value={[vadSettings.silenceDurationMs]}
              onValueChange={([val]) =>
                setVadSettings({ ...vadSettings, silenceDurationMs: val })
              }
              min={200}
              max={2000}
              step={50}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Audio Level</Label>
        <AudioLevelMeter level={audioLevel} isActive={isListening} />
      </div>
    </div>
  );
}
