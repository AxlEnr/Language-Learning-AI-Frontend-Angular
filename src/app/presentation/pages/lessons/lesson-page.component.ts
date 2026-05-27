import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ILessonUseCase, IProgressUseCase } from '../../../core/domain/ports/in';
import { LESSON_USE_CASE, PROGRESS_USE_CASE } from '../../../di/tokens';
import { Lesson, Exercise } from '../../../core/domain/entities';
import { LESSON_TYPE_LABELS } from '../../../core/domain/enums';

@Component({
  selector: 'app-lesson-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page container" *ngIf="lesson">
      <a routerLink="/modules" class="back-link">&larr; Back to Modules</a>
      <div class="lesson-header mt-2"><h2>{{ lesson.title }}</h2><span class="level-badge">{{ LESSON_TYPE_LABELS[lesson.type] || lesson.type }}</span></div>
      <div *ngIf="!lessonStarted && lesson.exercises" class="text-center mt-4">
        <p class="text-secondary mb-3">Ready to start? This lesson has {{ lesson.exercises.length }} exercises.</p>
        <button class="btn btn-primary btn-lg" (click)="startLesson()" [disabled]="starting"><span *ngIf="starting" class="spinner"></span> {{ starting ? 'Starting...' : 'Start Lesson' }}</button>
      </div>
      <div *ngIf="lessonStarted && currentExercise" class="exercise-area mt-3">
        <div class="flex justify-between mb-2"><span class="text-secondary">Exercise {{ currentIndex + 1 }} of {{ lesson.exercises?.length || 0 }}</span><span class="text-muted">{{ EXERCISE_LABELS[currentExercise.type] || currentExercise.type }}</span></div>
        <div class="progress-bar mb-3"><div class="progress-fill" [style.width.%]="progressPercent"></div></div>
        <div class="exercise-card card">
          <h3 class="exercise-prompt mb-3">{{ currentExercise.prompt }}</h3>
          <div *ngIf="currentExercise.type === 'multiple_choice' && currentExercise.metadata?.options" class="options-grid">
            <button *ngFor="let option of currentExercise.metadata!.options; let i = index" class="option-btn" [class.selected]="selectedAnswer === optionIndex(i)" (click)="selectedAnswer = optionIndex(i)">{{ option }}</button>
          </div>
          <div *ngIf="currentExercise.type !== 'multiple_choice'"><input type="text" [(ngModel)]="selectedAnswer" class="answer-input" placeholder="Type your answer..." /></div>
          <div class="mt-3 flex justify-between">
            <button class="btn btn-ghost" (click)="finishLesson()">Finish</button>
            <button *ngIf="!submitted" class="btn btn-primary" (click)="submitAnswer()" [disabled]="!selectedAnswer || submitting"><span *ngIf="submitting" class="spinner"></span> {{ submitting ? 'Submitting...' : 'Submit' }}</button>
          </div>
          <div *ngIf="feedback" class="feedback-card mt-3" [class.correct]="lastCorrect" [class.incorrect]="!lastCorrect">
            <p>{{ feedback }}</p>
            <button *ngIf="currentIndex < (lesson.exercises?.length || 0) - 1" class="btn btn-primary btn-sm mt-2" (click)="nextExercise()">Next Exercise</button>
            <button *ngIf="currentIndex >= (lesson.exercises?.length || 0) - 1" class="btn btn-primary btn-sm mt-2" (click)="finishLesson()">Complete Lesson</button>
          </div>
        </div>
      </div>
      <div *ngIf="completed" class="completion-card text-center mt-4"><h2 class="text-success">Lesson Completed!</h2><p class="text-secondary mt-1">Score: {{ finalScore }}%</p><a routerLink="/modules" class="btn btn-primary mt-3">Back to Modules</a></div>
    </div>
    <div class="page container text-center mt-4" *ngIf="!lesson"><div class="spinner" style="width:32px;height:32px;margin:0 auto;"></div></div>
  `,
  styles: [`
    .back-link { color: var(--text-secondary); font-size: 14px; text-decoration: none; }
    .back-link:hover { color: var(--primary-light); }
    .lesson-header { display: flex; align-items: center; gap: 12px; }
    .level-badge { display: inline-block; padding: 4px 10px; background: rgba(192, 57, 43, 0.15); color: var(--primary-light); border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; }
    .exercise-area { max-width: 680px; margin: 0 auto; }
    .exercise-card { padding: 32px; }
    .exercise-prompt { font-size: 18px; font-weight: 500; line-height: 1.6; }
    .progress-bar { height: 4px; background: var(--bg-surface); border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 2px; transition: width 0.3s ease; }
    .options-grid { display: grid; gap: 10px; }
    .option-btn { width: 100%; padding: 14px 18px; text-align: left; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: 15px; cursor: pointer; transition: all 0.2s ease; }
    .option-btn:hover { border-color: var(--primary); background: rgba(192, 57, 43, 0.08); }
    .option-btn.selected { border-color: var(--primary); background: rgba(192, 57, 43, 0.15); }
    .answer-input { width: 100%; padding: 14px; font-size: 16px; }
    .feedback-card { padding: 16px; border-radius: var(--radius-md); font-size: 14px; }
    .feedback-card.correct { background: rgba(39, 174, 96, 0.1); border: 1px solid rgba(39, 174, 96, 0.2); color: var(--success); }
    .feedback-card.incorrect { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); color: var(--error); }
    .completion-card { padding: 48px 24px; }
    .completion-card h2 { font-size: 32px; }
  `],
})
export class LessonPageComponent implements OnInit {
  lesson: Lesson | null = null; lessonStarted = false; currentIndex = 0; currentExercise: Exercise | null = null;
  selectedAnswer = ''; submitted = false; submitting = false; feedback = ''; lastCorrect = false;
  correctCount = 0; completed = false; finalScore = 0; starting = false;
  LESSON_TYPE_LABELS = LESSON_TYPE_LABELS;
  EXERCISE_LABELS: Record<string, string> = { multiple_choice: 'Multiple Choice', fill_blank: 'Fill in the Blank', translation: 'Translation', speaking: 'Speaking', ai_chat: 'AI Chat' };

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(LESSON_USE_CASE) private readonly lessonUseCase: ILessonUseCase,
    @Inject(PROGRESS_USE_CASE) private readonly progressUseCase: IProgressUseCase,
  ) {}

  get progressPercent(): number {
    if (!this.lesson?.exercises) return 0;
    return (this.currentIndex / this.lesson.exercises.length) * 100;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.lessonUseCase.getLesson(id).subscribe({ next: (data) => { this.lesson = data; if (data.exercises?.length) this.currentExercise = data.exercises[0]; }, error: () => {} });
  }

  startLesson(): void {
    if (!this.lesson) return;
    this.starting = true;
    this.progressUseCase.startLesson(this.lesson.id).subscribe({ next: () => { this.lessonStarted = true; this.starting = false; }, error: () => { this.lessonStarted = true; this.starting = false; } });
  }

  submitAnswer(): void {
    if (!this.currentExercise || !this.selectedAnswer || this.submitting) return;
    this.submitting = true;
    this.progressUseCase.submitAnswer(this.currentExercise.id, this.selectedAnswer).subscribe({
      next: (r) => { this.submitted = true; this.submitting = false; this.lastCorrect = r.is_correct ?? false; this.feedback = r.feedback || (this.lastCorrect ? 'Correct!' : 'Incorrect.'); if (this.lastCorrect) this.correctCount++; },
      error: () => { this.submitting = false; this.submitted = true; this.lastCorrect = false; this.feedback = 'Failed to submit.'; },
    });
  }

  nextExercise(): void {
    if (!this.lesson?.exercises) return;
    this.currentIndex++; this.currentExercise = this.lesson.exercises[this.currentIndex];
    this.selectedAnswer = ''; this.submitted = false; this.feedback = '';
  }

  optionIndex(i: number): string { return i.toString(); }

  finishLesson(): void {
    if (!this.lesson) return;
    const total = this.lesson.exercises?.length || 1;
    const score = Math.round((this.correctCount / total) * 100);
    this.progressUseCase.completeLesson(this.lesson.id, score).subscribe({ next: () => { this.completed = true; this.finalScore = score; }, error: () => { this.completed = true; this.finalScore = score; } });
  }
}
