import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { toastInterceptor } from './infrastructure/api/toast.interceptor';
import { provideRouter } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';

import { AUTH_USE_CASE, DASHBOARD_USE_CASE, MODULE_USE_CASE, LESSON_USE_CASE, PROGRESS_USE_CASE, AI_USE_CASE, VOCABULARY_USE_CASE, USER_USE_CASE, LANGUAGE_USE_CASE, AUTH_REPOSITORY, LANGUAGE_REPOSITORY, MODULE_REPOSITORY, LESSON_REPOSITORY, PROGRESS_REPOSITORY, AI_REPOSITORY, VOCABULARY_REPOSITORY, USER_REPOSITORY, TOKEN_STORAGE } from './di/tokens';

import { AuthUseCase } from './core/use-cases/auth.use-case';
import { DashboardUseCase } from './core/use-cases/dashboard.use-case';
import { ModuleUseCase } from './core/use-cases/module.use-case';
import { LessonUseCase } from './core/use-cases/lesson.use-case';
import { ProgressUseCase } from './core/use-cases/progress.use-case';
import { AIUseCase } from './core/use-cases/ai.use-case';
import { VocabularyUseCase } from './core/use-cases/vocabulary.use-case';
import { UserUseCase } from './core/use-cases/user.use-case';
import { LanguageUseCase } from './core/use-cases/language.use-case';

import { AuthApiAdapter } from './infrastructure/api/auth-api.adapter';
import { LanguageApiAdapter } from './infrastructure/api/language-api.adapter';
import { ModuleApiAdapter } from './infrastructure/api/module-api.adapter';
import { LessonApiAdapter } from './infrastructure/api/lesson-api.adapter';
import { ProgressApiAdapter } from './infrastructure/api/progress-api.adapter';
import { AIApiAdapter } from './infrastructure/api/ai-api.adapter';
import { VocabularyApiAdapter } from './infrastructure/api/vocabulary-api.adapter';
import { UserApiAdapter } from './infrastructure/api/user-api.adapter';
import { TokenStorageAdapter } from './infrastructure/auth/token-storage.adapter';
import { HttpClientAdapter } from './infrastructure/api/http-client.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([toastInterceptor])),
    provideRouter(routes),

    HttpClientAdapter,

    { provide: TOKEN_STORAGE, useClass: TokenStorageAdapter },

    { provide: AUTH_REPOSITORY, useClass: AuthApiAdapter },
    { provide: LANGUAGE_REPOSITORY, useClass: LanguageApiAdapter },
    { provide: MODULE_REPOSITORY, useClass: ModuleApiAdapter },
    { provide: LESSON_REPOSITORY, useClass: LessonApiAdapter },
    { provide: PROGRESS_REPOSITORY, useClass: ProgressApiAdapter },
    { provide: AI_REPOSITORY, useClass: AIApiAdapter },
    { provide: VOCABULARY_REPOSITORY, useClass: VocabularyApiAdapter },
    { provide: USER_REPOSITORY, useClass: UserApiAdapter },

    { provide: AUTH_USE_CASE, useClass: AuthUseCase },
    { provide: DASHBOARD_USE_CASE, useClass: DashboardUseCase },
    { provide: MODULE_USE_CASE, useClass: ModuleUseCase },
    { provide: LESSON_USE_CASE, useClass: LessonUseCase },
    { provide: PROGRESS_USE_CASE, useClass: ProgressUseCase },
    { provide: AI_USE_CASE, useClass: AIUseCase },
    { provide: VOCABULARY_USE_CASE, useClass: VocabularyUseCase },
    { provide: USER_USE_CASE, useClass: UserUseCase },
    { provide: LANGUAGE_USE_CASE, useClass: LanguageUseCase },
  ],
};
