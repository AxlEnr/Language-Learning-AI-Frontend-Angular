export interface User {
  id: number;
  name: string;
  email: string;
  native_language_id: number | null;
  target_language_id: number | null;
  level_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface LanguagesResponse {
  languages: Language[]
}

export interface Level {
  id: number;
  code: string;
  description: string | null;
}

export interface Module {
  id: number;
  language_id: number;
  level_id: number;
  title: string;
  description: string | null;
  order_index: number;
  language?: Language;
  level?: Level;
  lessons?: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  type: LessonType;
  order_index: number;
  exercises?: Exercise[];
  progress?: UserLessonProgress;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  prompt: string;
  metadata: ExerciseMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseMetadata {
  options?: string[];
  correct_option?: number;
  blank_word?: string;
  accepted_answers?: string[];
  source_text?: string;
  [key: string]: unknown;
}

export interface UserLessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  status: ProgressStatus;
  score: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAnswer {
  id: number;
  user_id: number;
  exercise_id: number;
  answer: string;
  is_correct: boolean | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill: SkillType;
  level: number;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: number;
  user_id: number;
  xp: number;
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: number;
  language_id: number;
  word: string;
  meaning: string | null;
  example_sentence: string | null;
}

export interface UserWord {
  id: number;
  user_id: number;
  word_id: number;
  familiarity: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  word?: Word;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: number;
  user_id: number;
  context: Record<string, unknown> | null;
  messages?: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  conversation_id: number;
  role: AIRole;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  user: User;
  skills: UserSkill[];
  stats: UserStats;
  modules_count: number;
  completed_lessons: number;
  words_learned: number;
}

export interface WordProgress {
  total: number;
  mastered: number;
  due_for_review: number;
  progress_percentage: number;
}

export type LessonType = 'vocabulary' | 'grammar' | 'listening' | 'speaking';
export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'translation' | 'speaking' | 'ai_chat';
export type SkillType = 'vocabulary' | 'grammar' | 'listening' | 'speaking';
export type ProgressStatus = 'locked' | 'in_progress' | 'completed';
export type AIRole = 'user' | 'assistant';
