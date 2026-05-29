import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IVoiceRepository } from '../domain/ports/out';
import { IVoiceUseCase } from '../domain/ports/in';
import { SpeechToTextResult, TextToSpeechResult, PronunciationFeedback, VoiceConversationResult, TTSVoice, TTSFormat } from '../domain/entities';
import { VOICE_REPOSITORY } from '../../di/tokens';

@Injectable()
export class VoiceUseCase implements IVoiceUseCase {
  constructor(@Inject(VOICE_REPOSITORY) private readonly voiceRepo: IVoiceRepository) {}

  speechToText(audio: Blob, language?: string): Observable<SpeechToTextResult> {
    return this.voiceRepo.speechToText(audio, language);
  }

  textToSpeech(text: string, voice?: TTSVoice, model?: string, format?: TTSFormat): Observable<TextToSpeechResult> {
    return this.voiceRepo.textToSpeech(text, voice, model, format);
  }

  evaluatePronunciation(audio: Blob, expectedText: string, language?: string): Observable<PronunciationFeedback> {
    return this.voiceRepo.evaluatePronunciation(audio, expectedText, language);
  }

  voiceConversation(conversationId: number, audio: Blob, voice?: TTSVoice, format?: TTSFormat, language?: string): Observable<VoiceConversationResult> {
    return this.voiceRepo.voiceConversation(conversationId, audio, voice, format, language);
  }
}
