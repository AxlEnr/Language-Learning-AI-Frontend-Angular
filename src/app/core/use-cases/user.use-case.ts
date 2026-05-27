import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserRepository } from '../domain/ports/out';
import { IUserUseCase, UpdateProfileInput } from '../domain/ports/in';
import { User, UserSkill, UserStats } from '../domain/entities';
import { USER_REPOSITORY } from '../../di/tokens';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  updateProfile(data: UpdateProfileInput): Observable<User> { return this.userRepo.updateProfile(data); }
  getSkills(): Observable<UserSkill[]> { return this.userRepo.getSkills(); }
  getStats(): Observable<UserStats> { return this.userRepo.getStats(); }
}
