import { Injectable, Inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IVocabularyRepository } from '../domain/ports/out';
import { IVocabularyUseCase } from '../domain/ports/in';
import { UserWord, WordProgress, WordProgressResponse } from '../domain/entities';
import { VOCABULARY_REPOSITORY } from '../../di/tokens';

@Injectable()
export class VocabularyUseCase implements IVocabularyUseCase {
  constructor(@Inject(VOCABULARY_REPOSITORY) private readonly vocabularyRepo: IVocabularyRepository) {}

  getWordsForReview(): Observable<UserWord[]> { return this.vocabularyRepo.getWordsForReview(); }
  reviewWord(userWordId: number, wasCorrect: boolean): Observable<UserWord> { return this.vocabularyRepo.reviewWord(userWordId, wasCorrect); }
  addWord(wordId: number): Observable<UserWord> { return this.vocabularyRepo.addWord(wordId); }
  getMasteredWords(): Observable<UserWord[]> { return this.vocabularyRepo.getMasteredWords(); }
  getProgress(): Observable<WordProgress> { 
    return this.vocabularyRepo.getProgress().pipe(
      map((response: WordProgressResponse) => response.progress)
    ); 
  }
}
