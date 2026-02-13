import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { realtimeService } from '@/services/RealtimeService';
import { audioCaptureService } from '@/services/AudioCaptureService';
import { notesService } from '@/services/NotesService';
import { v4 as uuidv4 } from 'uuid';

export function useRealtimeConnection() {
  const connectionStatus = useSessionStore(s => s.connectionStatus);
  const setConnectionStatus = useSessionStore(s => s.setConnectionStatus);
  const isMuted = useSessionStore(s => s.isMuted);
  const inputMode = useSessionStore(s => s.inputMode);
  const isPushToTalkActive = useSessionStore(s => s.isPushToTalkActive);
  const selectedDeviceId = useSessionStore(s => s.selectedDeviceId);
  const noteSets = useSessionStore(s => s.noteSets);
  const activeNoteSetIds = useSessionStore(s => s.activeNoteSetIds);
  const vadSettings = useSessionStore(s => s.vadSettings);
  const systemPrompt = useSessionStore(s => s.systemPrompt);
  const audioInput = useSessionStore(s => s.audioInput);
  const appendTranscript = useSessionStore(s => s.appendTranscript);
  const appendAnswerDelta = useSessionStore(s => s.appendAnswerDelta);
  const finalizeAnswer = useSessionStore(s => s.finalizeAnswer);
  const setIsListening = useSessionStore(s => s.setIsListening);
  const connectedRef = useRef(false);
  const audioStartedRef = useRef(false);

  const startAudioCapture = useCallback(async () => {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    try {
      const state = useSessionStore.getState();
      if (state.audioInput.micEnabled) {
        await audioCaptureService.startMic(state.selectedDeviceId || undefined);
      }
      audioCaptureService.onAudioData((base64Audio: string) => {
        const state = useSessionStore.getState();
        if (state.isMuted) return;
        if (state.inputMode === 'push-to-talk' && !state.isPushToTalkActive) return;
        realtimeService.sendAudio(base64Audio);
      });
      console.log('Audio capture started');
    } catch (err) {
      console.error('Failed to start audio capture:', err);
      audioStartedRef.current = false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (connectedRef.current) return;
    connectedRef.current = true;
    audioStartedRef.current = false;

    setConnectionStatus('connecting');

    realtimeService.on('connectionChange', (status: string) => {
      setConnectionStatus(status as any);
      if (status === 'connected') {
        const state = useSessionStore.getState();
        const instructions = notesService.buildSystemPrompt(state.systemPrompt, state.noteSets, state.activeNoteSetIds);
        const turnDetection = state.inputMode === 'vad' ? {
          type: 'server_vad',
          threshold: state.vadSettings.threshold,
          prefix_padding_ms: state.vadSettings.prefixPaddingMs,
          silence_duration_ms: state.vadSettings.silenceDurationMs,
          create_response: true,
        } : null;
        realtimeService.updateSession({ instructions, turnDetection });
      }
      if (status === 'disconnected') {
        connectedRef.current = false;
        audioStartedRef.current = false;
      }
    });

    realtimeService.on('sessionReady', () => {
      console.log('Session configured, starting audio capture');
      startAudioCapture();
    });

    realtimeService.on('speechStarted', () => setIsListening(true));
    realtimeService.on('speechStopped', () => setIsListening(false));

    realtimeService.on('userTranscript', (transcript) => {
      if (transcript && transcript.trim()) {
        appendTranscript({
          id: uuidv4(),
          role: 'user',
          content: transcript.trim(),
          timestamp: Date.now(),
        });
      }
    });

    realtimeService.on('answerDelta', (delta) => {
      appendAnswerDelta(delta);
    });

    realtimeService.on('answerDone', () => {
      finalizeAnswer();
    });

    realtimeService.on('error', (error: any) => {
      console.error('Realtime error:', error);
    });

    realtimeService.connect();
  }, [startAudioCapture]);

  const disconnect = useCallback(() => {
    connectedRef.current = false;
    audioStartedRef.current = false;
    realtimeService.disconnect();
    audioCaptureService.stop();
    setConnectionStatus('disconnected');
    setIsListening(false);
  }, []);

  useEffect(() => {
    audioCaptureService.setMuted(isMuted);
  }, [isMuted]);

  const pttWasActiveRef = useRef(false);

  useEffect(() => {
    if (inputMode !== 'push-to-talk' || connectionStatus !== 'connected') return;
    if (isPushToTalkActive && !isMuted) {
      pttWasActiveRef.current = true;
      setIsListening(true);
    } else if (!isPushToTalkActive) {
      if (pttWasActiveRef.current) {
        realtimeService.commitAudio();
        pttWasActiveRef.current = false;
      }
      setIsListening(false);
    }
  }, [isPushToTalkActive, inputMode, connectionStatus, isMuted]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return { connect, disconnect, connectionStatus };
}
