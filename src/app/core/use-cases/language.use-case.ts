import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ILanguageRepository } from '../domain/ports/out';
import { ILanguageUseCase } from '../domain/ports/in';
import { Language } from '../domain/entities';
import { LANGUAGE_REPOSITORY } from '../../di/tokens';

@Injectable()
export class LanguageUseCase implements ILanguageUseCase {
  constructor(@Inject(LANGUAGE_REPOSITORY) private readonly repo: ILanguageRepository) {}

  getLanguages(): Observable<Language[]> {
    return this.repo.getLanguages();
  }

  getLanguage(id: number): Observable<Language> {
    return this.repo.getLanguage(id);
  }
}