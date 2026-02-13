import { cn } from '@/lib/utils';

interface AudioLevelMeterProps {
  level: number;
  isActive: boolean;
}

export function AudioLevelMeter({ level, isActive }: AudioLevelMeterProps) {
  const clampedLevel = Math.max(0, Math.min(1, level));

  return (
    <div className="h-3 w-full rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-100 ease-out',
          isActive ? 'bg-green-500' : 'bg-gray-500'
        )}
        style={{ width: `${clampedLevel * 100}%` }}
      />
    </div>
  );
}
