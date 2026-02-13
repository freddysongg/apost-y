import { useRef, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { AnswerPanel } from '@/components/overlay/AnswerPanel';
import { TranscriptPanel } from '@/components/overlay/TranscriptPanel';
import { StatusBar } from '@/components/overlay/StatusBar';
import { ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';

export function OverlayLayout() {
  const transcriptHeight = useSessionStore((s) => s.transcriptHeight);
  const setTranscriptHeight = useSessionStore((s) => s.setTranscriptHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const expanded = transcriptHeight > 30;

  const toggleExpand = useCallback(() => {
    if (expanded) {
      setTranscriptHeight(0);
    } else {
      setTranscriptHeight(150);
    }
  }, [expanded, setTranscriptHeight]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = transcriptHeight;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [transcriptHeight]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = startYRef.current - e.clientY;
    const newHeight = Math.max(60, Math.min(500, startHeightRef.current + delta));
    setTranscriptHeight(newHeight);
  }, [setTranscriptHeight]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-[hsl(var(--card))] rounded-lg overflow-hidden border border-[hsl(var(--border))]"
    >
      <div className="flex-1 min-h-0">
        <AnswerPanel />
      </div>

      <div className="flex-shrink-0">
        <div
          className="flex items-center justify-center border-t border-[hsl(var(--border))] cursor-ns-resize select-none touch-none"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="flex items-center gap-2 py-1">
            <GripHorizontal className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
            <button
              onClick={toggleExpand}
              className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
              Transcript
            </button>
            <GripHorizontal className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          </div>
        </div>

        {expanded && (
          <div
            style={{ height: `${transcriptHeight}px` }}
            className="border-t border-[hsl(var(--border))]"
          >
            <TranscriptPanel />
          </div>
        )}
      </div>

      <StatusBar />
    </div>
  );
}
