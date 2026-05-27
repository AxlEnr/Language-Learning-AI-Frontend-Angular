import { Component, Inject, DestroyRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IAuthUseCase } from '../../../core/domain/ports/in';
import { AUTH_USE_CASE } from '../../../di/tokens';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1>&#9830; LinguaLearn</h1>
          <p class="text-secondary">Welcome back! Sign in to continue.</p>
        </div>
        <form (ngSubmit)="login()">
          <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" name="email" required placeholder="your@email.com" /></div>
          <div class="form-group"><label>Password</label><input type="password" [(ngModel)]="password" name="password" required placeholder="Your password" /></div>
          <div *ngIf="error" class="alert alert-error mt-2">{{ error }}</div>
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading" style="width:100%; margin-top:16px;">
            <span *ngIf="loading" class="spinner"></span> {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <div class="auth-footer"><span class="text-secondary">Don't have an account?</span> <a routerLink="/auth/register">Create one</a></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: var(--bg-primary); }
    .auth-card { width: 100%; max-width: 420px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
    .auth-footer { text-align: center; margin-top: 24px; display: flex; gap: 8px; justify-content: center; font-size: 14px; }
    .alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 14px; }
    .alert-error { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); color: var(--error); }
  `],
})
export class LoginPageComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private readonly router: Router,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
    private readonly destroyRef: DestroyRef,
  ) {}

  login(): void {
    if (!this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true;
    this.error = '';
    this.authUseCase.login({ email: this.email, password: this.password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => { this.error = err?.error?.message || 'Invalid credentials.'; this.loading = false; },
      });
  }
}