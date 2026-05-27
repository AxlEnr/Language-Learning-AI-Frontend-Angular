import { Component, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IAuthUseCase } from '../../core/domain/ports/in';
import { AUTH_USE_CASE } from '../../di/tokens';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/dashboard" class="logo">
          <span class="logo-icon">&#9830;</span>
          <span class="logo-text">LinguaLearn</span>
        </a>
      </div>
      <div class="navbar-links">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        <a routerLink="/modules" routerLinkActive="active">Modules</a>
        <a routerLink="/vocabulary" routerLinkActive="active">Vocabulary</a>
        <a routerLink="/ai-chat" routerLinkActive="active">AI Tutor</a>
        <a routerLink="/profile" routerLinkActive="active">Profile</a>
        <button class="btn btn-ghost btn-sm" (click)="logout()">Logout</button>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 24px;
      background: rgba(13, 13, 13, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .navbar-brand { display: flex; align-items: center; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text-primary); font-weight: 700; font-size: 18px; }
    .logo-icon { font-size: 24px; color: var(--primary); }
    .navbar-links { display: flex; align-items: center; gap: 4px; }
    .navbar-links a { padding: 8px 16px; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.2s ease; }
    .navbar-links a:hover { color: var(--text-primary); background: var(--bg-hover); }
    .navbar-links a.active { color: var(--primary-light); background: rgba(192, 57, 43, 0.1); }
    .main-content { min-height: calc(100vh - 64px); }
  `],
})
export class MainLayoutComponent {
  constructor(
    private readonly router: Router,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
  ) {}

  logout(): void {
    this.authUseCase.logout().subscribe(() => this.router.navigate(['/auth/login']));
  }
}
