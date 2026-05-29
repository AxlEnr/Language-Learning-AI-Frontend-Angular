import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IVoiceRepository } from '../../core/domain/ports/out';
import { SpeechToTextResult, TextToSpeechResult, PronunciationFeedback, VoiceConversationResult, TTSVoice, TTSFormat } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class VoiceApiAdapter implements IVoiceRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  speechToText(audio: Blob, language = 'en'): Observable<SpeechToTextResult> {
    const fd = new FormData();
    fd.append('audio', audio, 'recording.webm');
    fd.append('language', language);
    return this.http.postFormData<SpeechToTextResult>('/voice/speech-to-text', fd, { requireAuth: true });
  }

  textToSpeech(text: string, voice: TTSVoice = 'alloy', model?: string, format: TTSFormat = 'mp3'): Observable<TextToSpeechResult> {
    const fd = new FormData();
    fd.append('text', text);
    fd.append('voice', voice);
    fd.append('format', format);
    if (model) fd.append('model', model);
    return this.http.postFormData<TextToSpeechResult>('/voice/text-to-speech', fd, { requireAuth: true });
  }

  evaluatePronunciation(audio: Blob, expectedText: string, language = 'en'): Observable<PronunciationFeedback> {
    const fd = new FormData();
    fd.append('audio', audio, 'recording.webm');
    fd.append('expected_text', expectedText);
    fd.append('language', language);
    return this.http.postFormData<PronunciationFeedback>('/voice/pronunciation', fd, { requireAuth: true });
  }

  voiceConversation(conversationId: number, audio: Blob, voice: TTSVoice = 'alloy', format: TTSFormat = 'mp3', language = 'en'): Observable<VoiceConversationResult> {
    const fd = new FormData();
    fd.append('audio', audio, 'recording.webm');
    fd.append('voice', voice);
    fd.append('format', format);
    fd.append('language', language);
    return this.http.postFormData<VoiceConversationResult>(`/voice/conversations/${conversationId}`, fd, { requireAuth: true });
  }
}
