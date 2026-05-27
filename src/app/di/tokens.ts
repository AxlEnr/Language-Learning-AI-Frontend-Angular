import { InjectionToken } from '@angular/core';
import { IAuthUseCase, IDashboardUseCase, IModuleUseCase, ILessonUseCase, IProgressUseCase, IAIUseCase, IVocabularyUseCase, IUserUseCase, ILanguageUseCase } from '../core/domain/ports/in';
import { IAuthRepository, ILanguageRepository, IModuleRepository, ILessonRepository, IProgressRepository, IAIRepository, IVocabularyRepository, IUserRepository, ITokenStorage } from '../core/domain/ports/out';

export const AUTH_USE_CASE = new InjectionToken<IAuthUseCase>('AUTH_USE_CASE');
export const DASHBOARD_USE_CASE = new InjectionToken<IDashboardUseCase>('DASHBOARD_USE_CASE');
export const MODULE_USE_CASE = new InjectionToken<IModuleUseCase>('MODULE_USE_CASE');
export const LESSON_USE_CASE = new InjectionToken<ILessonUseCase>('LESSON_USE_CASE');
export const PROGRESS_USE_CASE = new InjectionToken<IProgressUseCase>('PROGRESS_USE_CASE');
export const AI_USE_CASE = new InjectionToken<IAIUseCase>('AI_USE_CASE');
export const VOCABULARY_USE_CASE = new InjectionToken<IVocabularyUseCase>('VOCABULARY_USE_CASE');
export const USER_USE_CASE = new InjectionToken<IUserUseCase>('USER_USE_CASE');
export const LANGUAGE_USE_CASE = new InjectionToken<ILanguageUseCase>('LANGUAGE_USE_CASE');

export const AUTH_REPOSITORY = new InjectionToken<IAuthRepository>('AUTH_REPOSITORY');
export const LANGUAGE_REPOSITORY = new InjectionToken<ILanguageRepository>('LANGUAGE_REPOSITORY');
export const MODULE_REPOSITORY = new InjectionToken<IModuleRepository>('MODULE_REPOSITORY');
export const LESSON_REPOSITORY = new InjectionToken<ILessonRepository>('LESSON_REPOSITORY');
export const PROGRESS_REPOSITORY = new InjectionToken<IProgressRepository>('PROGRESS_REPOSITORY');
export const AI_REPOSITORY = new InjectionToken<IAIRepository>('AI_REPOSITORY');
export const VOCABULARY_REPOSITORY = new InjectionToken<IVocabularyRepository>('VOCABULARY_REPOSITORY');
export const USER_REPOSITORY = new InjectionToken<IUserRepository>('USER_REPOSITORY');
export const TOKEN_STORAGE = new InjectionToken<ITokenStorage>('TOKEN_STORAGE');
