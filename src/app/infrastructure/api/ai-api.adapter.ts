import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAIRepository } from '../../core/domain/ports/out';
import { AIConversation, Exercise, Lesson, ExerciseType, SkillType } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class AIApiAdapter implements IAIRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  startConversation(topic?: string, difficulty?: number, context?: Record<string, unknown>): Observable<AIConversation> {
    return this.http.post<AIConversation>('/ai/conversations', { topic, difficulty, context });
  }

  listConversations(): Observable<AIConversation[]> {
    return this.http.get<AIConversation[]>('/ai/conversations');
  }

  getConversation(conversationId: number): Observable<AIConversation> {
    return this.http.get<AIConversation>(`/ai/conversations/${conversationId}`);
  }

  sendMessage(conversationId: number, message: string): Observable<{ message: string; tokens_used: number }> {
    return this.http.post<{ message: string; tokens_used: number }>(`/ai/conversations/${conversationId}/messages`, { message });
  }

  generateExercise(skill: SkillType, type: ExerciseType, topic?: string): Observable<Exercise> {
    return this.http.post<Exercise>('/ai/exercises/generate', { skill, type, topic });
  }

  recommendLesson(): Observable<Lesson | null> {
    return this.http.get<Lesson | null>('/ai/recommendations/lesson');
  }
}
