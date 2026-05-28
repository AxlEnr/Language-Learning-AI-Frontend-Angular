import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ILessonRepository } from '../../core/domain/ports/out';
import { Lesson, LessonResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class LessonApiAdapter implements ILessonRepository {
  constructor(private readonly http: HttpClientAdapter) { }

  getLesson(id: number): Observable<LessonResponse> {
    return this.http.get<LessonResponse>(`/lessons/${id}`, { requireAuth: true }).pipe(
      map((response: LessonResponse) => response)
    );
  }
}