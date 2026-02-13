import { useSessionStore } from '@/store/sessionStore';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SYSTEM_PROMPT_TEMPLATE } from '@/constants';
import { notesService } from '@/services/NotesService';

export function SystemPromptSettings() {
  const systemPrompt = useSessionStore((s) => s.systemPrompt);
  const setSystemPrompt = useSessionStore((s) => s.setSystemPrompt);
  const noteSets = useSessionStore((s) => s.noteSets);
  const activeNoteSetIds = useSessionStore((s) => s.activeNoteSetIds);

  const fullPrompt = notesService.buildSystemPrompt(systemPrompt, noteSets, activeNoteSetIds);
  const estimatedTokens = notesService.estimateTokens(fullPrompt);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>System Instructions</Label>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          These instructions define how the AI assistant behaves. Active note sets will be appended automatically.
        </p>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
          placeholder="Enter system instructions..."
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          ~{estimatedTokens.toLocaleString()} tokens (with active notes)
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSystemPrompt(SYSTEM_PROMPT_TEMPLATE)}
        >
          Reset to Default
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Preview (with notes)</Label>
        <div className="p-3 rounded-md bg-[hsl(var(--secondary))] max-h-[200px] overflow-y-auto">
          <pre className="text-xs text-[hsl(var(--muted-foreground))] whitespace-pre-wrap font-mono">
            {fullPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
}
