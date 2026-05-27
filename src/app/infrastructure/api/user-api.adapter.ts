import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserRepository } from '../../core/domain/ports/out';
import { User, UserSkill, UserStats } from '../../core/domain/entities';
import { HttpClientAdapter } from './http-client.adapter';
import { UpdateProfileInput } from '../../core/domain/ports/in';

@Injectable({ providedIn: 'root' })
export class UserApiAdapter implements IUserRepository {
  constructor(private readonly http: HttpClientAdapter) {}

  updateProfile(data: UpdateProfileInput): Observable<User> {
    return this.http.put<User>('/user/profile', data);
  }

  getSkills(): Observable<UserSkill[]> {
    return this.http.get<UserSkill[]>('/user/skills');
  }

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>('/user/stats');
  }
}
