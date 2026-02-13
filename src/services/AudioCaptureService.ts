import { floatTo16BitPCM, arrayBufferToBase64 } from '@/utils/audioEncoder';

const TARGET_SAMPLE_RATE = 24000;

export class AudioCaptureService {
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private systemSource: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private micGain: GainNode | null = null;
  private systemGain: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private muted = false;
  private audioDataCallback: ((base64Audio: string) => void) | null = null;
  private audioLevelCallback: ((level: number) => void) | null = null;
  private _micActive = false;
  private _systemActive = false;

  get micActive(): boolean { return this._micActive; }
  get systemActive(): boolean { return this._systemActive; }

  async startMic(deviceId?: string): Promise<void> {
    this.ensureContext();
    if (this.micSource) {
      this.stopMic();
    }

    const constraints: MediaStreamConstraints = {
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        echoCancellation: true,
        noiseSuppression: true,
      },
    };

    this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.micSource = this.audioContext!.createMediaStreamSource(this.micStream);
    this.micGain = this.audioContext!.createGain();
    this.micGain.gain.value = 1.0;
    this.micSource.connect(this.micGain);
    this.micGain.connect(this.processorNode!);
    this._micActive = true;
  }

  async startSystemAudio(): Promise<void> {
    this.ensureContext();
    if (this.systemSource) {
      this.stopSystemAudio();
    }

    const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

    if (isElectron) {
      this.systemStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });
      this.systemStream.getVideoTracks().forEach(t => t.stop());
    } else {
      try {
        this.systemStream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: false,
        });
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        if (error.name === 'NotAllowedError' || error.message?.includes('video')) {
          this.systemStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true,
          });
          this.systemStream.getVideoTracks().forEach(t => t.stop());
        } else {
          throw err;
        }
      }
    }

    const audioTracks = this.systemStream.getAudioTracks();
    if (audioTracks.length === 0) {
      this.systemStream.getTracks().forEach(t => t.stop());
      this.systemStream = null;
      throw new Error('No audio track found. Make sure to check "Share audio" when sharing your screen.');
    }

    this.systemSource = this.audioContext!.createMediaStreamSource(this.systemStream);
    this.systemGain = this.audioContext!.createGain();
    this.systemGain.gain.value = 1.0;
    this.systemSource.connect(this.systemGain);
    this.systemGain.connect(this.processorNode!);
    this._systemActive = true;

    audioTracks[0].addEventListener('ended', () => {
      this.stopSystemAudio();
    });
  }

  private ensureContext(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      const bufferSize = 4096;
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      const nativeSampleRate = this.audioContext.sampleRate;

      this.processorNode.onaudioprocess = (event) => {
        if (this.muted) return;

        const inputData = event.inputBuffer.getChannelData(0);

        if (this.audioLevelCallback) {
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          this.audioLevelCallback(rms);
        }

        if (this.audioDataCallback) {
          const inputCopy = new Float32Array(inputData.length);
          inputCopy.set(inputData);
          const samples = nativeSampleRate !== TARGET_SAMPLE_RATE
            ? this.resample(inputCopy, nativeSampleRate, TARGET_SAMPLE_RATE)
            : inputCopy;
          const pcm16 = floatTo16BitPCM(samples);
          const base64 = arrayBufferToBase64(pcm16);
          this.audioDataCallback(base64);
        }
      };

      this.processorNode.connect(this.audioContext.destination);
    }
  }

  private resample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
    const ratio = fromRate / toRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
      const frac = srcIndex - srcIndexFloor;
      output[i] = input[srcIndexFloor] * (1 - frac) + input[srcIndexCeil] * frac;
    }

    return output;
  }

  stopMic(): void {
    if (this.micGain) {
      this.micGain.disconnect();
      this.micGain = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this._micActive = false;
  }

  stopSystemAudio(): void {
    if (this.systemGain) {
      this.systemGain.disconnect();
      this.systemGain = null;
    }
    if (this.systemSource) {
      this.systemSource.disconnect();
      this.systemSource = null;
    }
    if (this.systemStream) {
      this.systemStream.getTracks().forEach(track => track.stop());
      this.systemStream = null;
    }
    this._systemActive = false;
  }

  stop(): void {
    this.stopMic();
    this.stopSystemAudio();
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  setMicGainValue(value: number): void {
    if (this.micGain) {
      this.micGain.gain.value = value;
    }
  }

  setSystemGainValue(value: number): void {
    if (this.systemGain) {
      this.systemGain.gain.value = value;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  onAudioData(callback: (base64Audio: string) => void): void {
    this.audioDataCallback = callback;
  }

  onAudioLevel(callback: (level: number) => void): void {
    this.audioLevelCallback = callback;
  }

  async getDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'audioinput');
  }
}

export const audioCaptureService = new AudioCaptureService();
