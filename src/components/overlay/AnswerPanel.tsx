import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { MarkdownText } from '@/components/shared/MarkdownText';

export function AnswerPanel() {
  const currentAnswer = useSessionStore((s) => s.currentAnswer);
  const isAnswering = useSessionStore((s) => s.isAnswering);
  const isListening = useSessionStore((s) => s.isListening);
  const connectionStatus = useSessionStore((s) => s.connectionStatus);
  const fontSize = useSessionStore((s) => s.fontSize);
  const transcript = useSessionStore((s) => s.transcript);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentAnswer, transcript.length]);

  const lastAssistantMessage = [...transcript].reverse().find(t => t.role === 'assistant');

  const getPlaceholder = () => {
    if (connectionStatus !== 'connected') {
      return 'Click "Connect" to start...';
    }
    if (isListening) {
      return 'Listening... speak now';
    }
    return 'Connected - waiting for speech...';
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-[hsl(var(--foreground))]">
        {currentAnswer ? (
          <>
            <MarkdownText text={currentAnswer} />
            {isAnswering && (
              <span className="inline-block w-2 h-4 ml-1 bg-[hsl(var(--foreground))] animate-pulse" />
            )}
          </>
        ) : lastAssistantMessage ? (
          <MarkdownText text={lastAssistantMessage.content} />
        ) : (
          <span className="text-[hsl(var(--muted-foreground))] italic">
            {getPlaceholder()}
          </span>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
