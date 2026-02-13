import { useState, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { ConnectionIndicator } from '@/components/shared/ConnectionIndicator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export function GeneralSettings() {
  const connectionStatus = useSessionStore((s) => s.connectionStatus);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false));
  }, []);

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
                  Your OpenAI API key is securely stored on the server.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">No API key found</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Set OPENAI_API_KEY as an environment variable on the server.
                </p>
              </div>
            </>
          )}
        </div>
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
