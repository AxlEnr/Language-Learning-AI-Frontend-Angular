import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { IAuthUseCase } from '../../core/domain/ports/in';
import { AUTH_USE_CASE } from '../../di/tokens';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
  ) {}

  canActivate(): boolean {
    if (this.authUseCase.isAuthenticated()) return true;
    this.router.navigate(['/auth/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    @Inject(AUTH_USE_CASE) private readonly authUseCase: IAuthUseCase,
  ) {}

  canActivate(): boolean {
    if (!this.authUseCase.isAuthenticated()) return true;
    this.router.navigate(['/dashboard']);
    return false;
  }
}
