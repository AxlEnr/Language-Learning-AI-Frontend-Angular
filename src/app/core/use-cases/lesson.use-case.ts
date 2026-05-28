import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ILessonRepository } from '../domain/ports/out';
import { ILessonUseCase } from '../domain/ports/in';
import { Lesson, LessonResponse } from '../domain/entities';
import { LESSON_REPOSITORY } from '../../di/tokens';

@Injectable()
export class LessonUseCase implements ILessonUseCase {
  constructor(@Inject(LESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository) { }

  getLesson(id: number): Observable<LessonResponse> {
    return this.lessonRepo.getLesson(id);
  }
}
