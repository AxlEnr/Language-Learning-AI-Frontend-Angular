import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IProgressRepository } from '../../core/domain/ports/out';
import { UserLessonProgress, UserAnswer, UserAnswerResponse, UserLessonProgressResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class ProgressApiAdapter implements IProgressRepository {
  constructor(private readonly http: HttpClientAdapter) { }

  getOverview(): Observable<UserLessonProgressResponse> {
    return this.http.get<UserLessonProgressResponse>('/progress', { requireAuth: true }).pipe(
      map((response) => ({ overview: response.overview, progress: response.progress }))
    );
  }

  startLesson(lessonId: number): Observable<UserLessonProgress> {
    return this.http.post<UserLessonProgress>('/progress/start', { lesson_id: lessonId }, { requireAuth: true });
  }

  submitAnswer(exerciseId: number, answer: string): Observable<UserAnswerResponse> {
    return this.http.post<UserAnswerResponse>('/progress/answer', { exercise_id: exerciseId, answer }, { requireAuth: true })
      .pipe(
        map((response: UserAnswerResponse) => response)
      );
  }

  completeLesson(lessonId: number, score: number): Observable<UserLessonProgress> {
    return this.http.post<UserLessonProgress>(`/progress/lessons/${lessonId}/complete`, { score }, { requireAuth: true });
  }
}