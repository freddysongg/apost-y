import { useSessionStore } from '@/store/sessionStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function AppearanceSettings() {
  const fontSize = useSessionStore((s) => s.fontSize);
  const setFontSize = useSessionStore((s) => s.setFontSize);
  const opacity = useSessionStore((s) => s.opacity);
  const setOpacity = useSessionStore((s) => s.setOpacity);
  const theme = useSessionStore((s) => s.theme);
  const setTheme = useSessionStore((s) => s.setTheme);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Font Size</Label>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={([val]) => setFontSize(val)}
          min={12}
          max={32}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Window Opacity</Label>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <Slider
          value={[opacity]}
          onValueChange={([val]) => setOpacity(val)}
          min={0.3}
          max={1.0}
          step={0.05}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Dark Theme</Label>
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>

      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="rounded-md border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))]/30">
          <p style={{ fontSize: `${fontSize}px` }} className="text-[hsl(var(--foreground))]">
            The quick brown fox jumps over the lazy dog.
          </p>
          <p
            style={{ fontSize: `${fontSize}px` }}
            className="text-[hsl(var(--muted-foreground))] mt-2"
          >
            10-4 Acknowledged. PC 211 - Robbery in progress.
          </p>
        </div>
      </div>
    </div>
  );
}
