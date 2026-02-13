import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { audioCaptureService } from '@/services/AudioCaptureService';
import { OverlayLayout } from '@/components/overlay/OverlayLayout';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Settings, Layers, Minimize2, Maximize2, Mic, MicOff, Monitor } from 'lucide-react';

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

  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

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

  const headerHeight = isElectron ? 'h-[42px]' : '';
  const headerPadding = isElectron ? 'pl-[78px] pr-3' : 'px-4 py-3';

  return (
    <div className={`h-screen w-screen flex flex-col text-[hsl(var(--foreground))] ${isElectron ? 'bg-transparent' : 'bg-[hsl(var(--background))]'}`}>
      <header
        className={`flex items-center justify-between shrink-0 border-b border-white/[0.06] ${headerHeight} ${headerPadding} ${isElectron ? 'bg-white/[0.03] backdrop-blur-2xl' : 'border-[hsl(var(--border))]'}`}
        style={isElectron ? { WebkitAppRegion: 'drag' } as React.CSSProperties : undefined}
      >
        <div
          className="flex items-center gap-2.5"
          style={isElectron ? { WebkitAppRegion: 'no-drag' } as React.CSSProperties : undefined}
        >
          <h1 className={`font-semibold tracking-tight ${isElectron ? 'text-[13px]' : 'text-lg font-bold'}`}>APOST-Y</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {connectionStatus}
            </span>
          </div>

          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-1.5 ml-1 pl-2.5 border-l border-white/[0.08]">
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                isMuted
                  ? 'bg-red-500/15 text-red-400'
                  : micActive
                    ? 'bg-green-500/15 text-green-400'
                    : 'text-[hsl(var(--muted-foreground))]'
              }`}>
                {isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                <span>{isMuted ? 'Muted' : micActive ? 'On' : 'Mic'}</span>
              </div>

              {sysActive && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-blue-500/15 text-blue-400">
                  <Monitor className="h-3 w-3" />
                  <span>Sys</span>
                </div>
              )}

              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                {inputMode === 'vad' ? 'VAD' : 'PTT'}
              </span>

              {isListening && (
                <span className="text-[11px] text-green-400 animate-pulse">Listening</span>
              )}
            </div>
          )}
        </div>
        <div
          className="flex items-center gap-1.5"
          style={isElectron ? { WebkitAppRegion: 'no-drag' } as React.CSSProperties : undefined}
        >
          {connectionStatus === 'disconnected' ? (
            <button
              onClick={connect}
              className={`px-3 rounded-md text-[12px] font-medium transition-colors bg-white text-black hover:bg-white/90 ${isElectron ? 'h-[26px]' : 'h-7'}`}
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className={`px-3 rounded-md text-[12px] font-medium transition-colors border border-white/[0.12] text-[hsl(var(--muted-foreground))] hover:bg-white/[0.06] ${isElectron ? 'h-[26px]' : 'h-7'}`}
            >
              Disconnect
            </button>
          )}
          <div className="flex items-center rounded-md border border-white/[0.12] overflow-hidden">
            <button
              onClick={() => setActivePanel('transcript')}
              className={`px-2 transition-colors ${isElectron ? 'h-[26px]' : 'h-7 px-3'} ${
                activePanel === 'transcript'
                  ? 'bg-white/[0.12] text-white'
                  : 'hover:bg-white/[0.06] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              <Layers size={13} />
            </button>
            <button
              onClick={() => setActivePanel('settings')}
              className={`px-2 transition-colors ${isElectron ? 'h-[26px]' : 'h-7 px-3'} ${
                activePanel === 'settings'
                  ? 'bg-white/[0.12] text-white'
                  : 'hover:bg-white/[0.06] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              <Settings size={13} />
            </button>
          </div>
          <button
            onClick={toggleAppMode}
            title="Enter Overlay Mode"
            className={`px-1.5 rounded-md transition-colors text-[hsl(var(--muted-foreground))] hover:bg-white/[0.06] hover:text-white ${isElectron ? 'h-[26px]' : 'h-7'}`}
          >
            <Minimize2 size={13} />
          </button>
        </div>
      </header>

      <main className={`flex-1 overflow-hidden ${isElectron ? 'bg-[hsl(var(--background))]/95' : ''}`}>
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
