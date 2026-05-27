import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IVocabularyRepository } from '../../core/domain/ports/out';
import { UserWord, WordProgress, WordProgressResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class VocabularyApiAdapter implements IVocabularyRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  getWordsForReview(): Observable<UserWord[]> {
    return this.http.get<UserWord[]>('/vocabulary/review', { requireAuth: true });
  }

  reviewWord(userWordId: number, wasCorrect: boolean): Observable<UserWord> {
    return this.http.post<UserWord>(`/vocabulary/review/${userWordId}`, { was_correct: wasCorrect }, { requireAuth: true });
  }

  addWord(wordId: number): Observable<UserWord> {
    return this.http.post<UserWord>(`/vocabulary/add/${wordId}`, {}, { requireAuth: true });
  }

  getMasteredWords(): Observable<UserWord[]> {
    return this.http.get<UserWord[]>('/vocabulary/mastered', { requireAuth: true });
  }

  getProgress(): Observable<WordProgressResponse> {
    return this.http.get<WordProgressResponse>('/vocabulary/progress', { requireAuth: true });
  }
}