import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IModuleRepository } from '../../core/domain/ports/out';
import { Module, ModulesResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';

@Injectable({ providedIn: 'root' })
export class ModuleApiAdapter implements IModuleRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  getModules(filters?: { language_id?: number; level_id?: number }): Observable<ModulesResponse> {
    let query = '';
    if (filters?.language_id) query += `language_id=${filters.language_id}&`;
    if (filters?.level_id) query += `level_id=${filters.level_id}&`;
    const path = query ? `/modules?${query.slice(0, -1)}` : '/modules';
    return this.http.get<ModulesResponse>(path, { requireAuth: true }).pipe(
      map((response: ModulesResponse) => ({
        ...response,
        modules: response.modules || [],
      }))
    );
  }

  getModule(id: number): Observable<Module> {
    return this.http.get<Module>(`/modules/${id}`, { requireAuth: true });
  }
}