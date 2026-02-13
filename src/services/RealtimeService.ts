type CallbackMap = {
  connectionChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
  transcriptUpdate: (entry: { role: 'user' | 'assistant'; content: string }) => void;
  answerDelta: (delta: string) => void;
  answerDone: () => void;
  error: (error: string) => void;
  speechStarted: () => void;
  speechStopped: () => void;
  userTranscript: (transcript: string) => void;
  sessionReady: () => void;
};

export class RealtimeService {
  private ws: WebSocket | null = null;
  private callbacks: Partial<CallbackMap> = {};
  private sessionConfigured = false;
  private pendingSessionConfig: { instructions?: string; turnDetection?: unknown } | null = null;

  connect(): void {
    if (this.ws) {
      this.disconnect();
    }

    this.sessionConfigured = false;
    this.callbacks.connectionChange?.('connecting');

    this.resolveWsUrl().then((url) => {
      this.ws = new WebSocket(url);
      this.attachSocketHandlers();
    });
  }

  private async resolveWsUrl(): Promise<string> {
    if (window.electronAPI?.server) {
      const port = await window.electronAPI.server.getPort();
      return `ws://127.0.0.1:${port}/ws`;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  private attachSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected to proxy');
      this.callbacks.connectionChange?.('connected');

      if (this.pendingSessionConfig) {
        this.sendSessionUpdate(this.pendingSessionConfig);
        this.pendingSessionConfig = null;
      }
    };

    this.ws.onclose = () => {
      this.callbacks.connectionChange?.('disconnected');
      this.ws = null;
      this.sessionConfigured = false;
    };

    this.ws.onerror = () => {
      this.callbacks.error?.('WebSocket connection error');
      this.callbacks.connectionChange?.('disconnected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleEvent(data);
      } catch {}
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionConfigured = false;
    this.callbacks.connectionChange?.('disconnected');
  }

  sendAudio(base64Audio: string): void {
    if (!this.sessionConfigured) return;
    this.send({
      type: 'input_audio_buffer.append',
      audio: base64Audio,
    });
  }

  commitAudio(): void {
    this.send({ type: 'input_audio_buffer.commit' });
    this.send({ type: 'response.create' });
  }

  cancelResponse(): void {
    this.send({ type: 'response.cancel' });
  }

  updateSession(config: { instructions?: string; turnDetection?: unknown }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSessionUpdate(config);
    } else {
      this.pendingSessionConfig = config;
    }
  }

  private sendSessionUpdate(config: { instructions?: string; turnDetection?: unknown }): void {
    const session: Record<string, unknown> = {
      input_audio_format: 'pcm16',
      modalities: ['text'],
      input_audio_transcription: {
        model: 'whisper-1',
      },
    };
    if (config.instructions) {
      session.instructions = config.instructions;
    }
    // Explicitly set turn_detection even when null to disable server_vad for push-to-talk
    if ('turnDetection' in config) {
      session.turn_detection = config.turnDetection;
    }
    const turnDetectionConfig = session.turn_detection as Record<string, unknown> | null;
    console.log('Sending session.update with config:', {
      modalities: session.modalities,
      hasInstructions: !!session.instructions,
      turnDetection: turnDetectionConfig?.type ?? 'none',
    });
    this.send({
      type: 'session.update',
      session,
    });
  }

  on<K extends keyof CallbackMap>(event: K, callback: CallbackMap[K]): void {
    this.callbacks[event] = callback;
  }

  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleEvent(data: any): void {
    switch (data.type) {
      case 'session.created':
        console.log('Session created:', data.session?.id);
        break;

      case 'session.updated':
        console.log('Session updated - modalities:', data.session?.modalities, 'transcription:', data.session?.input_audio_transcription);
        this.sessionConfigured = true;
        this.callbacks.sessionReady?.();
        break;

      case 'response.text.delta':
      case 'response.output_text.delta':
        if (data.delta) {
          this.callbacks.answerDelta?.(data.delta);
        }
        break;

      case 'response.audio_transcript.delta':
      case 'response.output_audio_transcript.delta':
        if (data.delta) {
          this.callbacks.answerDelta?.(data.delta);
        }
        break;

      case 'response.text.done':
      case 'response.output_text.done':
      case 'response.audio_transcript.done':
      case 'response.output_audio_transcript.done':
        this.callbacks.answerDone?.();
        break;

      case 'response.done':
        this.callbacks.answerDone?.();
        break;

      case 'response.audio.delta':
      case 'response.audio.done':
        break;

      case 'input_audio_buffer.speech_started':
        this.callbacks.speechStarted?.();
        break;

      case 'input_audio_buffer.speech_stopped':
        this.callbacks.speechStopped?.();
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (data.transcript) {
          console.log('User transcript:', data.transcript);
          this.callbacks.userTranscript?.(data.transcript);
        }
        break;

      case 'conversation.item.input_audio_transcription.delta':
        break;

      case 'conversation.item.created':
        break;

      case 'response.created':
      case 'response.output_item.added':
      case 'response.output_item.done':
      case 'response.content_part.added':
      case 'response.content_part.done':
      case 'input_audio_buffer.committed':
      case 'input_audio_buffer.cleared':
      case 'conversation.item.truncated':
      case 'rate_limits.updated':
        break;

      case 'error':
        console.error('Realtime API error:', data.error);
        this.callbacks.error?.(data.error?.message || 'Unknown error');
        break;

      default:
        console.log('Unhandled realtime event:', data.type);
        break;
    }
  }
}

export const realtimeService = new RealtimeService();
