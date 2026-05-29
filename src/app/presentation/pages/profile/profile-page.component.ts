import { Component, Inject, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUserUseCase, IAuthUseCase, ILanguageUseCase } from '../../../core/domain/ports/in';
import { USER_USE_CASE, AUTH_USE_CASE, LANGUAGE_USE_CASE } from '../../../di/tokens';
import { User, UserSkill, UserStats, Language } from '../../../core/domain/entities';
import { SKILL_LABELS } from '../../../core/domain/enums';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page container" style="max-width:680px;">
      <h2 class="mb-3">Profile</h2>
      <div class="card mb-3"><h3 class="mb-2">Account Info</h3>
        <form (ngSubmit)="updateProfile()">
          <div class="form-group"><label>Name</label><input type="text" [(ngModel)]="profileData.name" name="name" /></div>
          <div class="form-group"><label>Target Language</label><select [(ngModel)]="profileData.target_language_id" name="target_language_id"><option *ngFor="let lang of languages" [ngValue]="lang.id">{{ lang.name }}</option></select></div>
          <button type="submit" class="btn btn-primary" [disabled]="saving"><span *ngIf="saving" class="spinner"></span> {{ saving ? 'Saving...' : 'Save Changes' }}</button>
        </form>
      </div>
      <div class="card mb-3"><h3 class="mb-2">Skills</h3>
        <div class="skills-list" *ngIf="skills.length > 0">
          <div class="skill-row" *ngFor="let skill of skills"><span>{{ SKILL_LABELS[skill.skill] || skill.skill }}</span><div class="skill-bar"><div class="skill-fill" [style.width.%]="skill.level"></div></div><span class="text-primary">Lvl {{ skill.level }}</span></div>
        </div>
      </div>
      <div class="card"><h3 class="mb-2">Stats</h3>
        <div class="stats-grid" *ngIf="stats">
          <div class="stat-item"><span class="stat-val">{{ stats.xp }}</span><span class="stat-lbl">Total XP</span></div>
          <div class="stat-item"><span class="stat-val">{{ stats.streak_days }}</span><span class="stat-lbl">Day Streak</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skills-list { display: flex; flex-direction: column; gap: 12px; }
    .skill-row { display: grid; grid-template-columns: 120px 1fr 60px; align-items: center; gap: 12px; font-size: 14px; }
    .skill-bar { height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; }
    .skill-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.3s ease; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .stat-item { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; text-align: center; }
    .stat-val { display: block; font-size: 24px; font-weight: 700; color: var(--primary-light); }
    .stat-lbl { display: block; font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    select { width: 100%; padding: 10px 14px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: inherit; cursor: pointer; outline: none; }
    select:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.2); }
  `],
})
export class ProfilePageComponent implements OnInit {
  profileData = { name: '', target_language_id: null as number | null };
  skills: UserSkill[] = [];
  stats: UserStats | null = null;
  languages: Language[] = [];
  saving = false;
  SKILL_LABELS = SKILL_LABELS;

  constructor(
    @Inject(USER_USE_CASE) private readonly userUseCase: IUserUseCase,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
    @Inject(LANGUAGE_USE_CASE) private readonly languageUseCase: ILanguageUseCase,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.languageUseCase.getLanguages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (l) => { this.languages = l; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
    this.authUseCase.getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (u) => { this.profileData = { name: u.user.name, target_language_id: u.user.target_language_id }; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
    this.userUseCase.getSkills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (s) => { this.skills = s; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
    this.userUseCase.getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (s) => { this.stats = s; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
  }

  updateProfile(): void {
    this.saving = true;
    this.userUseCase.updateProfile({ name: this.profileData.name, target_language_id: this.profileData.target_language_id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => { this.saving = false; this.cdr.detectChanges(); }, error: () => { this.saving = false; this.cdr.detectChanges(); } });
  }
}