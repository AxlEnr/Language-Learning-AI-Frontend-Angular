import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IVocabularyRepository } from '../../core/domain/ports/out';
import { UserWord, WordProgress } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class VocabularyApiAdapter implements IVocabularyRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  getWordsForReview(): Observable<UserWord[]> {
    return this.http.get<UserWord[]>('/vocabulary/review');
  }

  reviewWord(userWordId: number, wasCorrect: boolean): Observable<UserWord> {
    return this.http.post<UserWord>(`/vocabulary/review/${userWordId}`, { was_correct: wasCorrect });
  }

  addWord(wordId: number): Observable<UserWord> {
    return this.http.post<UserWord>(`/vocabulary/add/${wordId}`, {});
  }

  getMasteredWords(): Observable<UserWord[]> {
    return this.http.get<UserWord[]>('/vocabulary/mastered');
  }

  getProgress(): Observable<WordProgress> {
    return this.http.get<WordProgress>('/vocabulary/progress');
  }
}
