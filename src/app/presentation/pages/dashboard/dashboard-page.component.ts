import { Component, Inject, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // 👈 Importante para el ciclo de vida
import { IDashboardUseCase, IAIUseCase } from '../../../core/domain/ports/in';
import { DASHBOARD_USE_CASE, AI_USE_CASE } from '../../../di/tokens';
import { Dashboard, Lesson } from '../../../core/domain/entities';
import { LESSON_TYPE_LABELS, SKILL_LABELS } from '../../../core/domain/enums';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterModule],
  template: `
    @if (dashboard) {
      <div class="page container">
        <div class="welcome-section">
          <h2>Welcome back, {{ dashboard.user.name }}!</h2>
          <p class="text-secondary">Keep up the great work on your learning journey.</p>
        </div>

        <div class="stats-grid mt-3">
          <div class="stat-card"><span class="stat-value">{{ dashboard.stats.xp }}</span><span class="stat-label">XP</span></div>
          <div class="stat-card"><span class="stat-value">{{ dashboard.stats.streak_days }}</span><span class="stat-label">Day Streak</span></div>
          <div class="stat-card"><span class="stat-value">{{ dashboard.modules_count }}</span><span class="stat-label">Modules</span></div>
          <div class="stat-card"><span class="stat-value">{{ dashboard.words_learned }}</span><span class="stat-label">Words</span></div>
        </div>

        <div class="mt-4">
          <h3>Your Skills</h3>
          <div class="skills-grid mt-2">
            @for (skill of dashboard.skills; track skill.skill) {
              <div class="skill-card">
                <div class="flex justify-between">
                  <span class="skill-name">{{ SKILL_LABELS[skill.skill] || skill.skill }}</span>
                  <span class="skill-level text-primary">Level {{ skill.level }}</span>
                </div>
                <div class="progress-bar mt-1">
                  <div class="progress-fill" [style.width.%]="skill.level"></div>
                </div>
              </div>
            }
          </div>
        </div>

        @if (recommendedLesson) {
          <div class="mt-4">
            <h3 class="mb-2">Recommended for You</h3>
            <div class="card card-hover">
              <div class="flex justify-between items-center">
                <div>
                  <h4>{{ recommendedLesson.title }}</h4>
                  <span class="badge mt-1">{{ LESSON_TYPE_LABELS[recommendedLesson.type] || recommendedLesson.type }}</span>
                </div>
                <a [routerLink]="['/lessons', recommendedLesson.id]" class="btn btn-primary btn-sm">Start Lesson</a>
              </div>
            </div>
          </div>
        }

        <div class="mt-4 text-center">
          <a routerLink="/modules" class="btn btn-outline">Browse All Modules</a>
        </div>
      </div>
    } @else {
      <div class="page container text-center mt-4">
        <div class="spinner" style="width:32px;height:32px;margin:0 auto;"></div>
      </div>
    }
  `,
  styles: [`
    .welcome-section { text-align: center; padding: 20px 0; }
    .welcome-section h2 { font-size: 28px; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; text-align: center; }
    .stat-value { display: block; font-size: 32px; font-weight: 700; color: var(--primary-light); }
    .stat-label { display: block; font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .skill-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; }
    .skill-name { font-weight: 500; }
    .skill-level { font-weight: 600; font-size: 14px; }
    .progress-bar { height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 3px; transition: width 0.3s ease; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(192, 57, 43, 0.15); color: var(--primary-light); border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .skills-grid { grid-template-columns: 1fr; } }
  `],
})
export class DashboardPageComponent implements OnInit {
  dashboard: Dashboard | null = null;
  recommendedLesson: Lesson | null = null;
  SKILL_LABELS = SKILL_LABELS;
  LESSON_TYPE_LABELS = LESSON_TYPE_LABELS;

  constructor(
    @Inject(DASHBOARD_USE_CASE) private readonly dashboardUseCase: IDashboardUseCase,
    @Inject(AI_USE_CASE) private readonly aiUseCase: IAIUseCase,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.dashboardUseCase.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (data.user && (data.user as any).user) {
            data.user = (data.user as any).user;
          }
          this.dashboard = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error crítico en el Dashboard:', err)
      });

    this.aiUseCase.recommendLesson()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lesson) => {
          this.recommendedLesson = lesson;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error crítico con IA:', err)
      });
  }
}