import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IUserRepository } from '../../core/domain/ports/out';
import { User, UserResponse, UserSkill, UserSkillResponse, UserStats, UserStatsResponse } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';
import { UpdateProfileInput } from '../../core/domain/ports/in';

@Injectable({ providedIn: 'root' })
export class UserApiAdapter implements IUserRepository {
  constructor(private readonly http: HttpClientAdapter) { }

  updateProfile(data: UpdateProfileInput): Observable<UserResponse> {
    return this.http.put<User>('/user/profile', data, { requireAuth: true }).pipe(
      map(res => ({ ...res, user: res as User }))
    );
  }

  getSkills(): Observable<UserSkillResponse> {
    return this.http.get<UserSkillResponse>('/user/skills', { requireAuth: true });
  }

  getStats(): Observable<UserStatsResponse> {
    return this.http.get<UserStatsResponse>('/user/stats', { requireAuth: true });
  }
}