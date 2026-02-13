import { cn } from '@/lib/utils';

interface ConnectionIndicatorProps {
  status: 'disconnected' | 'connecting' | 'connected';
}

const statusConfig = {
  disconnected: { color: 'bg-red-500', label: 'Disconnected' },
  connecting: { color: 'bg-yellow-500 animate-pulse', label: 'Connecting' },
  connected: { color: 'bg-green-500', label: 'Connected' },
};

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-2.5 w-2.5 rounded-full', config.color)} />
      <span className="text-xs text-[hsl(var(--muted-foreground))]">
        {config.label}
      </span>
    </div>
  );
}
