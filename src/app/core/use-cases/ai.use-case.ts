import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IAIRepository } from '../domain/ports/out';
import { IAIUseCase } from '../domain/ports/in';
import { AIConversation, Exercise, Lesson, ExerciseType, SkillType } from '../domain/entities';
import { AI_REPOSITORY } from '../../di/tokens';

@Injectable()
export class AIUseCase implements IAIUseCase {
  constructor(@Inject(AI_REPOSITORY) private readonly aiRepo: IAIRepository) {}

  startConversation(topic?: string, difficulty?: number, context?: Record<string, unknown>): Observable<AIConversation> {
    return this.aiRepo.startConversation(topic, difficulty, context);
  }

  listConversations(): Observable<AIConversation[]> {
    return this.aiRepo.listConversations();
  }

  getConversation(conversationId: number): Observable<AIConversation> {
    return this.aiRepo.getConversation(conversationId);
  }

  sendMessage(conversationId: number, message: string): Observable<{ message: string; tokens_used: number }> {
    return this.aiRepo.sendMessage(conversationId, message);
  }

  generateExercise(skill: SkillType, type: ExerciseType, topic?: string): Observable<Exercise> {
    return this.aiRepo.generateExercise(skill, type, topic);
  }

  recommendLesson(): Observable<Lesson | null> {
    return this.aiRepo.recommendLesson();
  }
}
