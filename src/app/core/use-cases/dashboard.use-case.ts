import { Injectable, Inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
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
  ) {}

  getDashboard(): Observable<Dashboard> {
    return this.authRepo.getCurrentUser().pipe(
      switchMap((user) =>
        forkJoin({
          skills: this.userRepo.getSkills(),
          stats: this.userRepo.getStats(),
          modules: this.moduleRepo.getModules({ language_id: user.target_language_id ?? undefined }),
          vocabulary: this.vocabularyRepo.getProgress(),
        }).pipe(
          map(({ skills, stats, modules, vocabulary }) => ({
            user,
            skills,
            stats,
            modules_count: modules.length,
            completed_lessons: 0,
            words_learned: vocabulary.total,
          })),
        ),
      ),
    );
  }
}
