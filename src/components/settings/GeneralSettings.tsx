import { useState, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { ConnectionIndicator } from '@/components/shared/ConnectionIndicator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';

function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

export function GeneralSettings() {
  const connectionStatus = useSessionStore((s) => s.connectionStatus);
  const apiKey = useSessionStore((s) => s.apiKey);
  const setApiKey = useSessionStore((s) => s.setApiKey);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const isElectron = isElectronEnvironment();

  useEffect(() => {
    if (isElectron) {
      setHasApiKey(!!apiKey);
      if (apiKey) {
        setKeyInput(apiKey);
      }
    } else {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => setHasApiKey(data.hasApiKey))
        .catch(() => setHasApiKey(false));
    }
  }, [isElectron, apiKey]);

  function handleApiKeySave(): void {
    const trimmed = keyInput.trim();
    if (trimmed) {
      setApiKey(trimmed);
    } else {
      setApiKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>API Key Status</Label>
        <div className="flex items-center gap-3 p-3 rounded-md bg-[hsl(var(--secondary))]">
          {hasApiKey === null ? (
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Checking...</span>
          ) : hasApiKey ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">API key configured</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {isElectron
                    ? 'Your OpenAI API key is saved to disk.'
                    : 'Your OpenAI API key is securely stored on the server.'}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">No API key found</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {isElectron
                    ? 'Enter your OpenAI API key below.'
                    : 'Set OPENAI_API_KEY as an environment variable on the server.'}
                </p>
              </div>
            </>
          )}
        </div>

        {isElectron && (
          <div className="space-y-2">
            <Label htmlFor="api-key-input">OpenAI API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="api-key-input"
                  type={isKeyVisible ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onBlur={handleApiKeySave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApiKeySave();
                  }}
                  placeholder="sk-..."
                  className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Changes take effect on next Connect.
            </p>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Connection Status</Label>
        <div className="flex items-center justify-between p-3 rounded-md bg-[hsl(var(--secondary))]">
          <ConnectionIndicator status={connectionStatus} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Model</Label>
        <div className="flex items-center gap-2 p-3 rounded-md bg-[hsl(var(--secondary))]">
          <Info className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm">gpt-4o-realtime-preview-2024-12-17</span>
          <Badge variant="secondary">Realtime</Badge>
        </div>
      </div>
    </div>
  );
}
