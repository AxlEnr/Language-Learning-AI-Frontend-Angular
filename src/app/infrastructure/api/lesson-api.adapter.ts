import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILessonRepository } from '../../core/domain/ports/out';
import { Lesson } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class LessonApiAdapter implements ILessonRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  getLesson(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`/lessons/${id}`, { requireAuth: true });
  }
}