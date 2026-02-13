import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { audioCaptureService } from '@/services/AudioCaptureService';
import { OverlayLayout } from '@/components/overlay/OverlayLayout';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Settings, Layers, Minimize2, Maximize2, Mic, MicOff, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const appMode = useSessionStore(s => s.appMode);
  const theme = useSessionStore(s => s.theme);
  const toggleAppMode = useSessionStore(s => s.toggleAppMode);
  const activePanel = useSessionStore(s => s.activePanel);
  const setActivePanel = useSessionStore(s => s.setActivePanel);
  const isMuted = useSessionStore(s => s.isMuted);
  const inputMode = useSessionStore(s => s.inputMode);
  const isListening = useSessionStore(s => s.isListening);
  const { connect, disconnect, connectionStatus } = useRealtimeConnection();

  const [micActive, setMicActive] = useState(false);
  const [sysActive, setSysActive] = useState(false);

  useHotkeys();

  useEffect(() => {
    const interval = setInterval(() => {
      setMicActive(audioCaptureService.micActive);
      setSysActive(audioCaptureService.systemActive);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  if (appMode === 'overlay') {
    return (
      <div className="h-screen w-screen bg-black">
        <div className="relative h-full">
          <OverlayLayout />
          <button
            onClick={toggleAppMode}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors z-50"
            title="Open Settings"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">APOST-Y</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {connectionStatus}
            </span>
          </div>

          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[hsl(var(--border))]">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
                isMuted
                  ? 'bg-red-500/15 text-red-400'
                  : micActive
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
              }`}>
                {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{isMuted ? 'Muted' : micActive ? 'Mic On' : 'Mic'}</span>
              </div>

              {sysActive && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-blue-500/15 text-blue-400">
                  <Monitor className="h-3.5 w-3.5" />
                  <span>System</span>
                </div>
              )}

              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {inputMode === 'vad' ? 'VAD' : 'PTT'}
              </span>

              {isListening && (
                <span className="text-xs text-green-400 animate-pulse">Listening</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === 'disconnected' ? (
            <Button size="sm" onClick={connect}>Connect</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={disconnect}>Disconnect</Button>
          )}
          <div className="flex items-center rounded-md border border-[hsl(var(--border))] overflow-hidden">
            <button
              onClick={() => setActivePanel('transcript')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                activePanel === 'transcript'
                  ? 'bg-white text-black'
                  : 'hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              <Layers size={14} />
            </button>
            <button
              onClick={() => setActivePanel('settings')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                activePanel === 'settings'
                  ? 'bg-white text-black'
                  : 'hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              <Settings size={14} />
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={toggleAppMode} title="Enter Overlay Mode">
            <Minimize2 size={14} />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activePanel === 'transcript' ? (
          <div className="h-full p-4 overflow-hidden">
            <OverlayLayout />
          </div>
        ) : activePanel === 'settings' ? (
          <div className="h-full overflow-auto">
            <SettingsLayout />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
