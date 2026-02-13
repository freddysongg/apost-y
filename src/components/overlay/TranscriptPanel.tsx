import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownText } from '@/components/shared/MarkdownText';
import { cn } from '@/lib/utils';

export function TranscriptPanel() {
  const transcript = useSessionStore((s) => s.transcript);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1.5 p-2">
        {transcript.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'max-w-[85%] rounded-md px-2.5 py-1.5 text-xs',
              entry.role === 'user'
                ? 'self-end bg-blue-600/70 text-white'
                : 'self-start bg-gray-700/70 text-gray-200'
            )}
          >
            {entry.role === 'assistant' ? (
              <MarkdownText text={entry.content} />
            ) : (
              entry.content
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
