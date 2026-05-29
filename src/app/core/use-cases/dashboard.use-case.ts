import { Injectable, Inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap, take, filter, tap, catchError, throwError } from 'rxjs';
import { IDashboardUseCase } from '../domain/ports/in';
import { IAuthRepository, IModuleRepository, IUserRepository, IVocabularyRepository } from '../domain/ports/out';
import { Dashboard } from '../domain/entities';
import { AUTH_REPOSITORY, MODULE_REPOSITORY, USER_REPOSITORY, VOCABULARY_REPOSITORY } from '../../di/tokens';

@Injectable()
export class DashboardUseCase implements IDashboardUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(MODULE_REPOSITORY) private readonly moduleRepo: IModuleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(VOCABULARY_REPOSITORY) private readonly vocabularyRepo: IVocabularyRepository,
  ) { }

  getDashboard(): Observable<Dashboard> {
    return this.authRepo.getCurrentUser().pipe(
      // 1. ESPÍA: Vemos qué está escupiendo la autenticación
      tap(user => console.log('🕵️ 1. Auth emitió:', user ? 'Usuario válido' : 'NULL')),

      // 2. FILTRO SALVAVIDAS: Si el usuario es null, no avanzamos (evita errores)
      filter((user) => !!user),

      // 3. Tomamos el primer valor VÁLIDO y cerramos la conexión
      take(1),

      switchMap((user) => {
        console.log('🕵️ 2. Iniciando peticiones paralelas (forkJoin)...');

        return forkJoin({
          skills: this.userRepo.getSkills().pipe(
            tap(res => console.log('🕵️ 3. Skills respondieron:', res)),
            take(1)
          ),
          stats: this.userRepo.getStats().pipe(
            tap(res => console.log('🕵️ 4. Stats respondieron:', res)),
            take(1)
          ),
          modules: this.moduleRepo.getModules({ language_id: user.user.target_language_id ?? undefined }).pipe(
            tap(res => console.log('🕵️ 5. Modules respondieron:', res)),
            take(1)
          ),
          vocabulary: this.vocabularyRepo.getProgress().pipe(
            tap(res => console.log('🕵️ 6. Vocabulary respondió:', res)),
            take(1)
          ),
        }).pipe(
          map(({ skills, stats, modules, vocabulary }) => {
            console.log('🕵️ 7. ¡Todas las peticiones terminaron con éxito! Armando Dashboard...');
            return {
              user: user,
              skills: skills?.skills || [],
              stats: stats?.stats || { xp: 0, streak_days: 0 },
              modules_count: modules?.modules?.length || 0,
              completed_lessons: 0,
              words_learned: vocabulary?.progress?.total || 0,
            };
          }),
          catchError((err) => {
            console.error('❌ Error CRÍTICO dentro del forkJoin:', err);
            return throwError(() => err);
          })
        );
      })
    );
  }
}