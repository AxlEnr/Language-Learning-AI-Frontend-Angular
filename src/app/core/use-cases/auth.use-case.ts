import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IAuthRepository, ITokenStorage } from '../domain/ports/out';
import { IAuthUseCase, LoginInput, RegisterInput } from '../domain/ports/in';
import { User, UserResponse } from '../domain/entities';
import { AUTH_REPOSITORY, TOKEN_STORAGE } from '../../di/tokens';

@Injectable()
export class AuthUseCase implements IAuthUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(TOKEN_STORAGE) private readonly tokenStorage: ITokenStorage,
  ) { }

  register(data: RegisterInput): Observable<{ user: User; token: string }> {
    return this.authRepo.register(data).pipe(
      tap((res) => this.tokenStorage.setToken(res.token)),
    );
  }

  login(data: LoginInput): Observable<{ user: User; token: string }> {
    return this.authRepo.login(data).pipe(
      tap((res) => this.tokenStorage.setToken(res.token)),
    );
  }

  logout(): Observable<void> {
    return this.authRepo.logout().pipe(
      tap(() => this.tokenStorage.removeToken()),
    );
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.authRepo.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.getToken() !== null;
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
