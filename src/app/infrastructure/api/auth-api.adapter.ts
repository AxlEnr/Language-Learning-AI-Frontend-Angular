import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthRepository } from '../../core/domain/ports/out';
import { User } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';
import { LoginInput, RegisterInput } from '../../core/domain/ports/in';

@Injectable({ providedIn: 'root' })
export class AuthApiAdapter implements IAuthRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  register(data: RegisterInput): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>('/auth/register', data, false);
  }

  login(data: LoginInput): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>('/auth/login', data, false);
  }

  logout(): Observable<void> {
    return this.http.post<void>('/auth/logout', {});
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>('/auth/user');
  }
}
