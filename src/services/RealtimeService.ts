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
  private pendingSessionConfig: { instructions?: string; turnDetection?: any } | null = null;

  connect(): void {
    if (this.ws) {
      this.disconnect();
    }

    this.sessionConfigured = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws`;

    this.callbacks.connectionChange?.('connecting');
    this.ws = new WebSocket(url);

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

  updateSession(config: { instructions?: string; turnDetection?: any }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSessionUpdate(config);
    } else {
      this.pendingSessionConfig = config;
    }
  }

  private sendSessionUpdate(config: { instructions?: string; turnDetection?: any }): void {
    const session: any = {
      input_audio_format: 'pcm16',
      modalities: ['text'],
      input_audio_transcription: {
        model: 'whisper-1',
      },
    };
    if (config.instructions) {
      session.instructions = config.instructions;
    }
    if (config.turnDetection) {
      session.turn_detection = config.turnDetection;
    }
    console.log('Sending session.update with config:', {
      modalities: session.modalities,
      hasInstructions: !!session.instructions,
      turnDetection: session.turn_detection?.type || 'none',
      transcription: session.input_audio_transcription?.model,
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
