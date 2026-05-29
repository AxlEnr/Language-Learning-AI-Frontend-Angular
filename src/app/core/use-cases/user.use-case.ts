import { Injectable, Inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IUserRepository } from '../domain/ports/out';
import { IUserUseCase, UpdateProfileInput } from '../domain/ports/in';
import { User, UserResponse, UserSkill, UserSkillResponse, UserStats, UserStatsResponse } from '../domain/entities';
import { USER_REPOSITORY } from '../../di/tokens';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) { }

  updateProfile(data: UpdateProfileInput): Observable<UserResponse> { return this.userRepo.updateProfile(data); }
  getSkills(): Observable<UserSkill[]> {
    return this.userRepo.getSkills().pipe(
      map((response: UserSkillResponse) => response.skills || [])
    );
  }
  getStats(): Observable<UserStats> {
    return this.userRepo.getStats().pipe(
      map((response: UserStatsResponse) => response.stats || { xp: 0, streak_days: 0 })
    );
  }
}
