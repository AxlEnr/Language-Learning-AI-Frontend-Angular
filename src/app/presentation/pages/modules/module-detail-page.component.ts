import { Component, Inject, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IModuleUseCase, IProgressUseCase } from '../../../core/domain/ports/in';
import { MODULE_USE_CASE, PROGRESS_USE_CASE } from '../../../di/tokens';
import { Module, UserLessonProgress } from '../../../core/domain/entities';
import { LESSON_TYPE_LABELS, PROGRESS_STATUS_LABELS } from '../../../core/domain/enums';

@Component({
  selector: 'app-module-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page container" *ngIf="module">
      <a routerLink="/modules" class="back-link">&larr; Back to Modules</a>
      <div class="flex justify-between items-start mt-2 mb-3"><div><h2>{{ module.title }}</h2><p class="text-secondary mt-1" *ngIf="module.description">{{ module.description }}</p><span class="level-badge mt-1" *ngIf="module.level">{{ module.level.code }} - {{ module.level.description }}</span><span class="level-badge mt-1 ml-1" *ngIf="module.language">{{ module.language.name }}</span></div></div>
      <h3 class="mb-2">Lessons</h3>
      <div class="lessons-list" *ngIf="module.lessons?.length">
        <div class="lesson-card card card-hover" *ngFor="let lesson of module.lessons; let i = index">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="lesson-number">{{ i + 1 }}</span>
              <div><h4>{{ lesson.title }}</h4>
                <div class="flex gap-1 mt-1">
                  <span class="mini-badge">{{ LESSON_TYPE_LABELS[lesson.type] || lesson.type }}</span>
                  <span class="status-badge" [class.completed]="getProgress(lesson.id)?.status === 'completed'" [class.in-progress]="getProgress(lesson.id)?.status === 'in_progress'">{{ PROGRESS_STATUS_LABELS[getProgress(lesson.id)?.status || 'locked'] }}</span>
                </div>
              </div>
            </div>
            <a [routerLink]="['/lessons', lesson.id]" class="btn btn-primary btn-sm">Start</a>
          </div>
        </div>
      </div>
      <div class="text-center mt-3" *ngIf="!module.lessons?.length"><p class="text-secondary">No lessons in this module yet.</p></div>
    </div>
    <div class="page container text-center mt-4" *ngIf="!module"><div class="spinner" style="width:32px;height:32px;margin:0 auto;"></div></div>
  `,
  styles: [`
    .back-link { color: var(--text-secondary); font-size: 14px; text-decoration: none; display: inline-block; margin-bottom: 8px; }
    .back-link:hover { color: var(--primary-light); }
    .level-badge { display: inline-block; padding: 4px 10px; background: rgba(192, 57, 43, 0.15); color: var(--primary-light); border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; }
    .lessons-list { display: flex; flex-direction: column; gap: 12px; }
    .lesson-card { transition: transform 0.2s ease; }
    .lesson-card:hover { transform: translateX(4px); }
    .lesson-number { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--primary); color: #fff; border-radius: 50%; font-size: 14px; font-weight: 600; flex-shrink: 0; }
    .lesson-card h4 { font-size: 16px; font-weight: 500; }
    .mini-badge { padding: 3px 8px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px; font-size: 11px; color: var(--text-muted); }
    .status-badge { padding: 3px 8px; background: rgba(107, 107, 107, 0.15); border-radius: 4px; font-size: 11px; color: var(--text-muted); }
    .status-badge.in-progress { background: rgba(243, 156, 18, 0.15); color: var(--warning); }
    .status-badge.completed { background: rgba(39, 174, 96, 0.15); color: var(--success); }
  `],
})
export class ModuleDetailPageComponent implements OnInit {
  module: Module | null = null;
  progressMap: Record<number, UserLessonProgress | undefined> = {};
  LESSON_TYPE_LABELS = LESSON_TYPE_LABELS;
  PROGRESS_STATUS_LABELS = PROGRESS_STATUS_LABELS;

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(MODULE_USE_CASE) private readonly moduleUseCase: IModuleUseCase,
    @Inject(PROGRESS_USE_CASE) private readonly progressUseCase: IProgressUseCase,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.moduleUseCase.getModule(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => { this.module = data; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
    this.progressUseCase.getOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => { p.forEach((x) => this.progressMap = { ...this.progressMap, [x.lesson_id]: x }); this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
  }

  getProgress(lessonId: number): UserLessonProgress | undefined { return this.progressMap[lessonId]; }
}