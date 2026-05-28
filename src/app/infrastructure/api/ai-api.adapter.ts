import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IAIRepository } from '../../core/domain/ports/out';
import { AIConversation, Exercise, Lesson, ExerciseType, SkillType } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

interface RecommendLessonResponse {
  lesson: Lesson;
}

@Injectable({ providedIn: 'root' })
export class AIApiAdapter implements IAIRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  startConversation(topic?: string, difficulty?: number, context?: Record<string, unknown>): Observable<AIConversation> {
    return this.http.post<AIConversation>('/ai/conversations', { topic, difficulty, context }, { requireAuth: true });
  }

  listConversations(): Observable<AIConversation[]> {
    return this.http.get<AIConversation[]>('/ai/conversations', { requireAuth: true });
  }

  getConversation(conversationId: number): Observable<AIConversation> {
    return this.http.get<AIConversation>(`/ai/conversations/${conversationId}`, { requireAuth: true });
  }

  sendMessage(conversationId: number, message: string): Observable<{ message: string; tokens_used: number }> {
    return this.http.post<{ message: string; tokens_used: number }>(`/ai/conversations/${conversationId}/messages`, { message }, { requireAuth: true });
  }

  generateExercise(skill: SkillType, type: ExerciseType, topic?: string): Observable<Exercise> {
    return this.http.post<Exercise>('/ai/exercises/generate', { skill, type, topic }, { requireAuth: true });
  }

  recommendLesson(): Observable<Lesson | null> {
    return this.http.get<RecommendLessonResponse | null>('/ai/recommendations/lesson', { requireAuth: true }).pipe(
      map(res => res ? { ...res.lesson, id: Number(res.lesson.id) } : null),
    );
  }
}