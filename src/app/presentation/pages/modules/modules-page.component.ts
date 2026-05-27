import { Component, Inject, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IModuleUseCase } from '../../../core/domain/ports/in';
import { MODULE_USE_CASE } from '../../../di/tokens';
import { Module } from '../../../core/domain/entities';
import { LESSON_TYPE_LABELS } from '../../../core/domain/enums';

@Component({
  selector: 'app-modules-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page container"><h2 class="mb-3">Language Modules</h2>
      <div class="loading" *ngIf="loading"><div class="spinner" style="width:32px;height:32px;margin:40px auto;"></div></div>
      <div *ngIf="!loading && modules.length === 0" class="text-center mt-4"><p class="text-secondary">No modules available yet. Set your target language in profile.</p></div>
      <div class="modules-grid" *ngIf="!loading && modules.length > 0">
        <div class="module-card card card-hover" *ngFor="let module of modules">
          <a [routerLink]="['/modules', module.id]" class="module-link">
            <div class="flex justify-between items-start mb-2"><h3>{{ module.title }}</h3><span class="level-badge" *ngIf="module.level">{{ module.level.code }}</span></div>
            <p class="text-secondary module-desc" *ngIf="module.description">{{ module.description }}</p>
            <div class="flex gap-1 mt-2" *ngIf="module.lessons">
              <span class="mini-badge" *ngFor="let lesson of module.lessons.slice(0, 4)">{{ LESSON_TYPE_LABELS[lesson.type] || lesson.type }}</span>
              <span class="text-muted" *ngIf="module.lessons.length > 4" style="font-size:12px;">+{{ module.lessons.length - 4 }} more</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .module-card { transition: transform 0.2s ease; }
    .module-card:hover { transform: translateY(-2px); }
    .module-link { display: block; color: inherit; text-decoration: none; }
    .module-link h3 { font-size: 18px; font-weight: 600; color: var(--text-primary); }
    .module-desc { font-size: 14px; line-height: 1.5; }
    .level-badge { padding: 4px 10px; background: rgba(192, 57, 43, 0.15); color: var(--primary-light); border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; }
    .mini-badge { padding: 3px 8px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px; font-size: 11px; color: var(--text-muted); }
  `],
})
export class ModulesPageComponent implements OnInit {
  modules: Module[] = [];
  loading = true;
  LESSON_TYPE_LABELS = LESSON_TYPE_LABELS;

  constructor(
    @Inject(MODULE_USE_CASE) private readonly moduleUseCase: IModuleUseCase,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.moduleUseCase.getModules()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.modules = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); },
      });
  }
}