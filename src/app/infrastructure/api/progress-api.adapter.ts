import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProgressRepository } from '../../core/domain/ports/out';
import { UserLessonProgress, UserAnswer } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class ProgressApiAdapter implements IProgressRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  getOverview(): Observable<UserLessonProgress[]> {
    return this.http.get<UserLessonProgress[]>('/progress');
  }

  startLesson(lessonId: number): Observable<UserLessonProgress> {
    return this.http.post<UserLessonProgress>('/progress/start', { lesson_id: lessonId });
  }

  submitAnswer(exerciseId: number, answer: string): Observable<UserAnswer> {
    return this.http.post<UserAnswer>('/progress/answer', { exercise_id: exerciseId, answer });
  }

  completeLesson(lessonId: number, score: number): Observable<UserLessonProgress> {
    return this.http.post<UserLessonProgress>(`/progress/lessons/${lessonId}/complete`, { score });
  }
}
