import { Observable } from 'rxjs';
import { User, Language, Module, Lesson, Exercise, UserLessonProgress, UserAnswer, UserSkill, UserStats, UserWord, AIConversation, Dashboard, WordProgress, ExerciseType, SkillType, UserSkillResponse, UserStatsResponse, ModulesResponse, WordProgressResponse } from '../../entities';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../in';

export interface IAuthRepository {
  register(data: RegisterInput): Observable<{ user: User; token: string }>;
  login(data: LoginInput): Observable<{ user: User; token: string }>;
  logout(): Observable<void>;
  getCurrentUser(): Observable<User>;
}

export interface ILanguageRepository {
  getLanguages(): Observable<Language[]>;
  getLanguage(id: number): Observable<Language>;
}

export interface IModuleRepository {
  getModules(filters?: { language_id?: number; level_id?: number }): Observable<ModulesResponse>;
  getModule(id: number): Observable<Module>;
}

export interface ILessonRepository { getLesson(id: number): Observable<Lesson>; }

export interface IProgressRepository {
  getOverview(): Observable<UserLessonProgress[]>;
  startLesson(lessonId: number): Observable<UserLessonProgress>;
  submitAnswer(exerciseId: number, answer: string): Observable<UserAnswer>;
  completeLesson(lessonId: number, score: number): Observable<UserLessonProgress>;
}

export interface IAIRepository {
  startConversation(topic?: string, difficulty?: number, context?: Record<string, unknown>): Observable<AIConversation>;
  listConversations(): Observable<AIConversation[]>;
  getConversation(conversationId: number): Observable<AIConversation>;
  sendMessage(conversationId: number, message: string): Observable<{ message: string; tokens_used: number }>;
  generateExercise(skill: SkillType, type: ExerciseType, topic?: string): Observable<Exercise>;
  recommendLesson(): Observable<Lesson | null>;
}

export interface IVocabularyRepository {
  getWordsForReview(): Observable<UserWord[]>;
  reviewWord(userWordId: number, wasCorrect: boolean): Observable<UserWord>;
  addWord(wordId: number): Observable<UserWord>;
  getMasteredWords(): Observable<UserWord[]>;
  getProgress(): Observable<WordProgressResponse>;
}

export interface IUserRepository {
  updateProfile(data: UpdateProfileInput): Observable<User>;
  getSkills(): Observable<UserSkillResponse>;
  getStats(): Observable<UserStatsResponse>;
}

export interface ITokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}
