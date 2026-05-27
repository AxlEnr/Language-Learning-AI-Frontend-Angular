import { Routes } from '@angular/router';
import { MainLayoutComponent } from './presentation/layouts/main-layout.component';
import { LoginPageComponent } from './presentation/pages/auth/login-page.component';
import { RegisterPageComponent } from './presentation/pages/auth/register-page.component';
import { DashboardPageComponent } from './presentation/pages/dashboard/dashboard-page.component';
import { ModulesPageComponent } from './presentation/pages/modules/modules-page.component';
import { ModuleDetailPageComponent } from './presentation/pages/modules/module-detail-page.component';
import { LessonPageComponent } from './presentation/pages/lessons/lesson-page.component';
import { VocabularyPageComponent } from './presentation/pages/vocabulary/vocabulary-page.component';
import { AIChatPageComponent } from './presentation/pages/ai-chat/ai-chat-page.component';
import { ProfilePageComponent } from './presentation/pages/profile/profile-page.component';
import { AuthGuard, GuestGuard } from './presentation/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'modules', component: ModulesPageComponent },
      { path: 'modules/:id', component: ModuleDetailPageComponent },
      { path: 'lessons/:id', component: LessonPageComponent },
      { path: 'vocabulary', component: VocabularyPageComponent },
      { path: 'ai-chat', component: AIChatPageComponent },
      { path: 'profile', component: ProfilePageComponent },
    ],
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: 'register', component: RegisterPageComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
