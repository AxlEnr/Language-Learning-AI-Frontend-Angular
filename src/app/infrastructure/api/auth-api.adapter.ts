import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IAuthRepository } from '../../core/domain/ports/out';
import { User, UserResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';
import { LoginInput, RegisterInput } from '../../core/domain/ports/in';

@Injectable({ providedIn: 'root' })
export class AuthApiAdapter implements IAuthRepository {
  constructor(private readonly http: HttpClientAdapter) { }

  register(data: RegisterInput): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>('/auth/register', data, { requireAuth: false, skipToast: true });
  }

  login(data: LoginInput): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>('/auth/login', data, { requireAuth: false, skipToast: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>('/auth/logout', {}, { requireAuth: true });
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/auth/user', { requireAuth: true }).pipe(
      map(res => ({ ...res, user: res.user as User }))
    );
  }
}
