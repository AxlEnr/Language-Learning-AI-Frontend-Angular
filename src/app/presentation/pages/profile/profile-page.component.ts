import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IUserUseCase, IAuthUseCase } from '../../../core/domain/ports/in';
import { USER_USE_CASE, AUTH_USE_CASE } from '../../../di/tokens';
import { User, UserSkill, UserStats, Language } from '../../../core/domain/entities';
import { SKILL_LABELS } from '../../../core/domain/enums';
import { LanguageApiAdapter } from '../../../infrastructure/api/language-api.adapter';

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
          <span class="text-success ml-1" *ngIf="saved">Saved!</span>
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
  skills: UserSkill[] = []; stats: UserStats | null = null; languages: Language[] = []; saving = false; saved = false;
  SKILL_LABELS = SKILL_LABELS;

  constructor(
    @Inject(USER_USE_CASE) private readonly userUseCase: IUserUseCase,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
    private readonly languageApi: LanguageApiAdapter,
  ) {}

  ngOnInit(): void {
    this.languageApi.getLanguages().subscribe({ next: (l) => this.languages = l, error: () => {} });
    this.authUseCase.getCurrentUser().subscribe({ next: (u) => this.profileData = { name: u.name, target_language_id: u.target_language_id }, error: () => {} });
    this.userUseCase.getSkills().subscribe({ next: (s) => this.skills = s, error: () => {} });
    this.userUseCase.getStats().subscribe({ next: (s) => this.stats = s, error: () => {} });
  }

  updateProfile(): void {
    this.saving = true; this.saved = false;
    this.userUseCase.updateProfile({ name: this.profileData.name, target_language_id: this.profileData.target_language_id }).subscribe({ next: () => { this.saving = false; this.saved = true; setTimeout(() => this.saved = false, 3000); }, error: () => this.saving = false });
  }
}
