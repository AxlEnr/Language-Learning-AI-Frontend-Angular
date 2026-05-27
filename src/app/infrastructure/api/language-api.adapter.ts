import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ILanguageRepository } from '../../core/domain/ports/out';
import { Language, LanguagesResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class LanguageApiAdapter implements ILanguageRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  getLanguages(): Observable<Language[]> {
    return this.http.get<LanguagesResponse>('/languages', false).pipe(
      map((response) => response.languages)
    );
  }
  getLanguage(id: number): Observable<Language> {
    return this.http.get<Language>(`/languages/${id}`, false);
  }
}
