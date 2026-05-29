import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IAIRepository } from '../../core/domain/ports/out';
import { AIConversation, Exercise, Lesson, ExerciseType, SkillType, AIConversationsResponse, AIConversationResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

interface RecommendLessonResponse {
  lesson: Lesson;
}

@Injectable({ providedIn: 'root' })
export class AIApiAdapter implements IAIRepository {
  constructor(private readonly http: HttpClientAdapter) { }

  startConversation(topic?: string, difficulty?: number, context?: Record<string, unknown>): Observable<AIConversation> {
    return this.http.post<AIConversation>('/ai/conversations', { topic, difficulty, context }, { requireAuth: true });
  }

  listConversations(): Observable<AIConversationsResponse> {
    return this.http.get<AIConversationsResponse>('/ai/conversations', { requireAuth: true }).pipe(
      map(res => ({ ...res, conversations: res.conversations as AIConversation[] }))
    );
  }

  getConversation(conversationId: number): Observable<AIConversationResponse> {
    return this.http.get<AIConversationResponse>(`/ai/conversations/${conversationId}`, { requireAuth: true }).pipe(
      map(res => ({ ...res, conversation: res.conversation as AIConversation }))
    );
  }


  sendMessage(conversationId: number, message: string): Observable<{ response: string; tokens_used: number; }> {
    return this.http.post<{ response: string; tokens_used: number; }>(`/ai/conversations/${conversationId}/messages`, { message }, { requireAuth: true }).pipe(
      map(res => ({ ...res, response: res.response as string }))
    );
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