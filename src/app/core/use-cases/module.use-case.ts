import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IModuleRepository } from '../domain/ports/out';
import { IModuleUseCase } from '../domain/ports/in';
import { Module } from '../domain/entities';
import { MODULE_REPOSITORY } from '../../di/tokens';

@Injectable()
export class ModuleUseCase implements IModuleUseCase {
  constructor(@Inject(MODULE_REPOSITORY) private readonly moduleRepo: IModuleRepository) {}

  getModules(filters?: { language_id?: number; level_id?: number }): Observable<Module[]> {
    return this.moduleRepo.getModules(filters);
  }

  getModule(id: number): Observable<Module> {
    return this.moduleRepo.getModule(id);
  }
}
