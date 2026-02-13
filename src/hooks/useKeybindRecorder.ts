import { useState, useEffect, useCallback } from 'react';

interface RecorderState {
  isRecording: boolean;
  accelerator: string | null;
}

export function useKeybindRecorder() {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    accelerator: null,
  });

  const startRecording = useCallback(() => {
    setState({ isRecording: true, accelerator: null });
  }, []);

  const stopRecording = useCallback(() => {
    setState(prev => ({ ...prev, isRecording: false }));
  }, []);

  useEffect(() => {
    if (!state.isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const modifierKeys = ['Control', 'Shift', 'Alt', 'Meta'];
      if (modifierKeys.includes(e.key)) return;

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('CmdOrCtrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      let key = e.key;
      if (key === ' ') key = 'Space';
      else if (key === 'Escape') key = 'Escape';
      else if (key.length === 1) key = key.toUpperCase();

      parts.push(key);
      const accelerator = parts.join('+');

      setState({ isRecording: false, accelerator });
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [state.isRecording]);

  return {
    isRecording: state.isRecording,
    recordedAccelerator: state.accelerator,
    startRecording,
    stopRecording,
    clearRecorded: () => setState({ isRecording: false, accelerator: null }),
  };
}
