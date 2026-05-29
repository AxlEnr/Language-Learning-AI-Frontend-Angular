import { Observable } from 'rxjs';
import { User, Language, Module, Lesson, Exercise, UserLessonProgress, UserAnswer, UserSkill, UserStats, Word, UserWord, AIConversation, Dashboard, WordProgress, LessonType, ExerciseType, SkillType, LessonResponse, UserAnswerResponse, UserLessonProgressResponse, AIConversationResponse, AIConversationsResponse, UserResponse } from '../../entities';

export interface IAuthUseCase {
  register(data: RegisterInput): Observable<{ user: User; token: string }>;
  login(data: LoginInput): Observable<{ user: User; token: string }>;
  logout(): Observable<void>;
  getCurrentUser(): Observable<UserResponse>;
  isAuthenticated(): boolean;
  getToken(): string | null;
}

export interface IDashboardUseCase { getDashboard(): Observable<Dashboard>; }
export interface IModuleUseCase {
  getModules(filters?: { language_id?: number; level_id?: number }): Observable<Module[]>;
  getModule(id: number): Observable<Module>;
}

export interface ILessonUseCase { getLesson(id: number): Observable<LessonResponse>; }
export interface IProgressUseCase {
  getOverview(): Observable<UserLessonProgressResponse>;
  startLesson(lessonId: number): Observable<UserLessonProgress>;
  submitAnswer(exerciseId: number, answer: string): Observable<UserAnswerResponse>;
  completeLesson(lessonId: number, score: number): Observable<UserLessonProgress>;
}

export interface IAIUseCase {
  startConversation(topic?: string, difficulty?: number, context?: Record<string, unknown>): Observable<AIConversation>;
  listConversations(): Observable<AIConversationsResponse>;
  getConversation(conversationId: number): Observable<AIConversationResponse>;
  sendMessage(conversationId: number, message: string): Observable<{ response: string; tokens_used: number }>;
  generateExercise(skill: SkillType, type: ExerciseType, topic?: string): Observable<Exercise>;
  recommendLesson(): Observable<Lesson | null>;
}

export interface IVocabularyUseCase {
  getWordsForReview(): Observable<UserWord[]>;
  reviewWord(userWordId: number, wasCorrect: boolean): Observable<UserWord>;
  addWord(wordId: number): Observable<UserWord>;
  getMasteredWords(): Observable<UserWord[]>;
  getProgress(): Observable<WordProgress>;
}

export interface ILanguageUseCase {
  getLanguages(): Observable<Language[]>;
  getLanguage(id: number): Observable<Language>;
}

export interface IUserUseCase {
  updateProfile(data: UpdateProfileInput): Observable<UserResponse>;
  getSkills(): Observable<UserSkill[]>;
  getStats(): Observable<UserStats>;
}

export interface RegisterInput {
  name: string; email: string; password: string; password_confirmation: string;
  native_language_id?: number; target_language_id: number; level_id?: number;
}

export interface LoginInput { email: string; password: string; }

export interface UpdateProfileInput {
  name?: string; native_language_id?: number | null;
  target_language_id?: number | null; level_id?: number | null;
}
