import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VoiceRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private _isRecording = false;

  get isRecording(): boolean {
    return this._isRecording;
  }

  async startRecording(): Promise<void> {
    if (this._isRecording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
    };

    this.mediaRecorder.start(250);
    this._isRecording = true;
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this._isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.mediaRecorder?.stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType ?? 'audio/webm' });
        this.chunks = [];
        this._isRecording = false;
        this.mediaRecorder = null;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancelRecording(): void {
    if (!this.mediaRecorder || !this._isRecording) return;
    this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    this.mediaRecorder.stop();
    this.chunks = [];
    this._isRecording = false;
    this.mediaRecorder = null;
  }

  static playAudio(url: string): HTMLAudioElement {
    const audio = new Audio(url);
    audio.play();
    return audio;
  }
}
