import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IProgressRepository } from '../domain/ports/out';
import { IProgressUseCase } from '../domain/ports/in';
import { UserLessonProgress, UserAnswer, UserAnswerResponse, UserLessonProgressResponse } from '../domain/entities';
import { PROGRESS_REPOSITORY } from '../../di/tokens';

@Injectable()
export class ProgressUseCase implements IProgressUseCase {
  constructor(@Inject(PROGRESS_REPOSITORY) private readonly progressRepo: IProgressRepository) { }

  getOverview(): Observable<UserLessonProgressResponse> {
    return this.progressRepo.getOverview();
  }

  startLesson(lessonId: number): Observable<UserLessonProgress> {
    return this.progressRepo.startLesson(lessonId);
  }

  submitAnswer(exerciseId: number, answer: string): Observable<UserAnswerResponse> {
    return this.progressRepo.submitAnswer(exerciseId, answer);
  }

  completeLesson(lessonId: number, score: number): Observable<UserLessonProgress> {
    return this.progressRepo.completeLesson(lessonId, score);
  }
}
