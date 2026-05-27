import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IAuthUseCase } from '../../../core/domain/ports/in';
import { AUTH_USE_CASE } from '../../../di/tokens';
import { LanguageApiAdapter } from '../../../infrastructure/api/language-api.adapter';
import { Language, LanguagesResponse } from '../../../core/domain/entities';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header"><h1>&#9830; LinguaLearn</h1><p class="text-secondary">Create your account and start learning.</p></div>
        <form (ngSubmit)="register()">
          <div class="form-group"><label>Name</label><input type="text" [(ngModel)]="name" name="name" required placeholder="Your name" /></div>
          <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" name="email" required placeholder="your@email.com" /></div>
          <div class="form-group"><label>Password</label><input type="password" [(ngModel)]="password" name="password" required placeholder="Min 8 characters" /></div>
          <div class="form-group"><label>Confirm Password</label><input type="password" [(ngModel)]="password_confirmation" name="password_confirmation" required placeholder="Confirm your password" /></div>
          <div class="form-group"><label>I want to learn</label>
            <select [(ngModel)]="target_language_id" name="target_language_id" required>
              <option [ngValue]="null" disabled>Select a language</option>
              @for (lang of languages; track lang.id) {
                <option [ngValue]="lang.id">{{ lang.name }}</option>
              }
            </select>
          </div>
          @if(error){
            <div class="alert alert-error mt-2">{{ error }}</div>
          }
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading" style="width:100%; margin-top:16px;">
            @if(loading){
              <span class="spinner"></span> {{ 'Creating account...' }}
            } @else {
              {{ 'Create Account' }}
            }
          </button>
        </form>
        <div class="auth-footer"><span class="text-secondary">Already have an account?</span> <a routerLink="/auth/login">Sign in</a></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: var(--bg-primary); }
    .auth-card { width: 100%; max-width: 420px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
    select { width: 100%; padding: 10px 14px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: inherit; cursor: pointer; outline: none; }
    select:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.2); }
    .auth-footer { text-align: center; margin-top: 24px; display: flex; gap: 8px; justify-content: center; font-size: 14px; }
    .alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 14px; }
    .alert-error { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); color: var(--error); }
  `],
})

export class RegisterPageComponent implements OnInit {
  name = ''; email = ''; password = ''; password_confirmation = ''; target_language_id: number | null = null;
  languages: Language[] = []; loading = false; error = '';

  constructor(
    private readonly router: Router,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
    // ⚠️ AÚN TIENES DEUDA TÉCNICA AQUÍ (Arquitectura Hexagonal)
    private readonly languageApi: LanguageApiAdapter, 
    private readonly destroyRef: DestroyRef 
  ) {}

  ngOnInit(): void {
    this.languageApi.getLanguages()
      .pipe(takeUntilDestroyed(this.destroyRef)) 
      .subscribe({ 
          next: (langs) => {
              this.languages = langs; 
          }, 
          error: () => {
              this.error = 'Failed to load languages.';
          }
      });
  }

  register(): void {
    if (!this.name || !this.email || !this.password || !this.password_confirmation || !this.target_language_id) { 
      this.error = 'Please fill in all fields.'; 
      return; 
    }
    if (this.password !== this.password_confirmation) { 
      this.error = 'Passwords do not match.'; 
      return; 
    }
    
    this.loading = true; 
    this.error = '';
    
    this.authUseCase.register({ 
      name: this.name, 
      email: this.email, 
      password: this.password, 
      password_confirmation: this.password_confirmation, 
      target_language_id: this.target_language_id 
    })
    .pipe(takeUntilDestroyed(this.destroyRef)) 
    .subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { 
        this.error = err?.error?.message || 'Registration failed.'; 
        this.loading = false; 
      },
    });
  }
}
