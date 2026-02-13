import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_KEYBINDS } from '@/constants';
import type { KeybindConfig } from '@/types';

const ACTION_LABELS: Record<keyof KeybindConfig, string> = {
  pushToTalk: 'Push to Talk',
  toggleMute: 'Toggle Mute',
  cancelResponse: 'Cancel Response',
  clearConversation: 'Clear Conversation',
  toggleOverlay: 'Toggle Overlay',
};

function formatKeybind(key: string): string {
  return key
    .replace('Key', '')
    .replace('Digit', '')
    .replace('Arrow', '→ ')
    .replace('Control', 'Ctrl')
    .replace('Meta', 'Cmd');
}

export function KeybindSettings() {
  const keybinds = useSessionStore((s) => s.keybinds);
  const setKeybinds = useSessionStore((s) => s.setKeybinds);
  const [recordingAction, setRecordingAction] = useState<keyof KeybindConfig | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!recordingAction) return;
      e.preventDefault();
      e.stopPropagation();

      const parts: string[] = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      if (e.metaKey) parts.push('Cmd');

      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        parts.push(e.code);
      }

      if (parts.length > 0 && !['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        const combo = parts.join('+');
        setKeybinds({ ...keybinds, [recordingAction]: combo });
        setRecordingAction(null);
      }
    },
    [recordingAction, keybinds, setKeybinds]
  );

  useEffect(() => {
    if (recordingAction) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [recordingAction, handleKeyDown]);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="text-left p-3 font-medium text-[hsl(var(--muted-foreground))]">Action</th>
              <th className="text-left p-3 font-medium text-[hsl(var(--muted-foreground))]">Keybind</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(ACTION_LABELS) as Array<keyof KeybindConfig>).map((action) => (
              <tr key={action} className="border-b border-[hsl(var(--border))] last:border-0">
                <td className="p-3">
                  <Label>{ACTION_LABELS[action]}</Label>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => setRecordingAction(action)}
                    className="px-3 py-1.5 rounded-md text-xs font-mono bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] transition-colors min-w-[120px] text-center"
                  >
                    {recordingAction === action ? (
                      <span className="text-yellow-400 animate-pulse">Press any key...</span>
                    ) : (
                      formatKeybind(keybinds[action])
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setKeybinds(DEFAULT_KEYBINDS)}
      >
        <RotateCcw className="h-4 w-4" />
        Reset to Defaults
      </Button>
    </div>
  );
}
