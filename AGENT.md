# LinguaLearn Frontend - Agent Guide

## Overview

**LinguaLearn** is an Angular-based frontend for the Language Learning API, built with **hexagonal (ports & adapters) architecture**. It provides a dark-themed, red-accented UI for the language learning platform covering modules, lessons, exercises, vocabulary, and AI chat.

## Tech Stack

| Component      | Technology                    |
|----------------|-------------------------------|
| Framework      | Angular 21.x                  |
| Language       | TypeScript 5.x                |
| Styling        | SCSS (CSS custom properties)  |
| HTTP           | Angular HttpClient            |
| Routing        | Angular Router                |
| State Mgmt     | RxJS Observables (service-based) |
| Auth           | Sanctum Bearer Token (localStorage) |
| Build          | Angular CLI / esbuild         |

## Hexagonal Architecture

The project follows **Ports & Adapters (Hexagonal)** pattern with clear separation:

```
src/app/
├── core/                          # INNER HEXAGON - Domain + Use Cases
│   ├── domain/
│   │   ├── entities/index.ts      # Business entities (interfaces)
│   │   ├── enums/index.ts         # Domain constants & labels
│   │   └── ports/
│   │       ├── in/index.ts        # Input ports (use case contracts)
│   │       └── out/index.ts       # Output ports (repository contracts)
│   └── use-cases/                 # Application use cases (implements input ports)
│       ├── auth.use-case.ts
│       ├── dashboard.use-case.ts
│       ├── module.use-case.ts
│       ├── lesson.use-case.ts
│       ├── progress.use-case.ts
│       ├── ai.use-case.ts
│       ├── vocabulary.use-case.ts
│       └── user.use-case.ts
├── infrastructure/                # OUTER HEXAGON - Adapters
│   ├── api/                       # HTTP API adapters (implements output ports)
│   │   ├── http-client.adapter.ts # Base HTTP client wrapper
│   │   ├── auth-api.adapter.ts
│   │   ├── language-api.adapter.ts
│   │   ├── module-api.adapter.ts
│   │   ├── lesson-api.adapter.ts
│   │   ├── progress-api.adapter.ts
│   │   ├── ai-api.adapter.ts
│   │   ├── vocabulary-api.adapter.ts
│   │   └── user-api.adapter.ts
│   └── auth/
│       └── token-storage.adapter.ts # Token persistence (localStorage)
├── presentation/                  # UI LAYER
│   ├── layouts/
│   │   └── main-layout.component.ts # Navbar + router-outlet shell
│   ├── pages/
│   │   ├── auth/login-page.component.ts
│   │   ├── auth/register-page.component.ts
│   │   ├── dashboard/dashboard-page.component.ts
│   │   ├── modules/modules-page.component.ts
│   │   ├── modules/module-detail-page.component.ts
│   │   ├── lessons/lesson-page.component.ts
│   │   ├── vocabulary/vocabulary-page.component.ts
│   │   ├── ai-chat/ai-chat-page.component.ts
│   │   └── profile/profile-page.component.ts
│   └── guards/
│       └── auth.guard.ts          # AuthGuard + GuestGuard
└── di/
    ├── tokens.ts                   # InjectionToken definitions
    └── providers.ts               # (deprecated, now in app.config.ts)
```

### Architecture Flow

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│  Pages → injects I*UseCase (via InjectionTokens)         │
└────────────────────┬─────────────────────────────────────┘
                     │ depends on (input ports)
┌────────────────────▼─────────────────────────────────────┐
│                    CORE / DOMAIN                          │
│  Ports (interfaces): IAuthUseCase, IModuleUseCase, etc.   │
│  Entities: User, Module, Lesson, Exercise, etc.          │
│  Enums: LESSON_TYPE_LABELS, SKILL_LABELS, etc.           │
└────────────────────┬─────────────────────────────────────┘
                     │ depends on (output ports)
┌────────────────────▼─────────────────────────────────────┐
│                    USE CASES                              │
│  AuthUseCase implements IAuthUseCase                     │
│  ModuleUseCase implements IModuleUseCase                 │
│  ...all use @Inject(AUTH_REPOSITORY) etc.                 │
└────────────────────┬─────────────────────────────────────┘
                     │ depends on
┌────────────────────▼─────────────────────────────────────┐
│               INFRASTRUCTURE (ADAPTERS)                   │
│  AuthApiAdapter implements IAuthRepository               │
│  ModuleApiAdapter implements IModuleRepository           │
│  TokenStorageAdapter implements ITokenStorage             │
│  HttpClientAdapter wraps Angular HttpClient              │
└──────────────────────────────────────────────────────────┘
```

## Dependency Injection

All wiring is done in `app.config.ts` using Angular's `InjectionToken` system:

| Token              | Interface             | Implementation      |
|--------------------|-----------------------|---------------------|
| AUTH_USE_CASE      | IAuthUseCase          | AuthUseCase         |
| AUTH_REPOSITORY    | IAuthRepository       | AuthApiAdapter      |
| MODULE_USE_CASE    | IModuleUseCase        | ModuleUseCase       |
| MODULE_REPOSITORY  | IModuleRepository     | ModuleApiAdapter    |
| TOKEN_STORAGE      | ITokenStorage         | TokenStorageAdapter |
| (8 use cases)      | (8 interfaces)        | (8 implementations) |
| (8 repositories)   | (8 interfaces)        | (8 API adapters)    |

## Routes

| Path                 | Component               | Guard    |
|----------------------|-------------------------|----------|
| /auth/login          | LoginPageComponent      | Guest    |
| /auth/register       | RegisterPageComponent   | Guest    |
| /dashboard           | DashboardPageComponent  | Auth     |
| /modules             | ModulesPageComponent    | Auth     |
| /modules/:id         | ModuleDetailPageComponent | Auth  |
| /lessons/:id         | LessonPageComponent     | Auth     |
| /vocabulary          | VocabularyPageComponent | Auth     |
| /ai-chat             | AIChatPageComponent     | Auth     |
| /profile             | ProfilePageComponent    | Auth     |

## API Communication

All API calls go through `HttpClientAdapter` which:
- Prepends `environment.apiUrl` (default: `http://localhost:80/api/v1`)
- Sets `Content-Type: application/json` and `Accept: application/json`
- Automatically attaches `Authorization: Bearer <token>` from localStorage when `requireAuth=true`

```typescript
// Example flow:
// 1. User clicks Login → LoginPageComponent calls AuthUseCase.login()
// 2. AuthUseCase calls AuthApiAdapter.login() → HttpClientAdapter.post('/auth/login', ...)
// 3. Response { user, token } → token stored in TokenStorageAdapter (localStorage)
// 4. Guard checks AuthUseCase.isAuthenticated() → reads token from TokenStorageAdapter
```

## Dark Theme (Red/Black)

CSS custom properties defined in `src/styles.scss`:

| Variable           | Color    | Usage                        |
|--------------------|----------|------------------------------|
| --bg-primary       | #0D0D0D  | Main background              |
| --bg-secondary     | #1A1A1A  | Cards, surfaces              |
| --bg-surface       | #242424  | Elevated surfaces            |
| --bg-hover         | #2A2A2A  | Hover states                 |
| --primary          | #C0392B  | Main accent (soft red)       |
| --primary-light    | #E74C3C  | Bright accent                |
| --primary-dark     | #922B21  | Darker red (hover states)    |
| --primary-muted    | #7B2D26  | Muted red (disabled states)  |
| --text-primary     | #E8E8E8  | Main text                    |
| --text-secondary   | #A0A0A0  | Secondary text               |
| --text-muted       | #6B6B6B  | Muted/placeholder text       |
| --border           | #333333  | Borders & dividers           |

Colors are intentionally soft and muted to avoid eye strain while maintaining the red/black aesthetic.

## Pages Overview

### Dashboard (`/dashboard`)
- User greeting with XP, streak, module count, word count
- Skill level progress bars (vocabulary, grammar, listening, speaking)
- AI-recommended next lesson
- Browse all modules link

### Modules (`/modules`, `/modules/:id`)
- Grid of available modules with language, level, and lesson type badges
- Module detail shows lesson list with progress status (locked/in_progress/completed)

### Lesson (`/lessons/:id`)
- Start lesson button with exercise count
- Exercise-by-exercise flow with:
  - Multiple choice: clickable options grid
  - Text input: typed answer (fill_blank, translation, speaking)
- Feedback card (correct/incorrect) with "Next" or "Complete" button
- Completion screen with final score

### Vocabulary (`/vocabulary`)
- Review tab: words due for spaced repetition, "I Know It" / "Still Learning" buttons
- Mastered tab: words with familiarity level 5
- Overall progress bar and stats

### AI Chat (`/ai-chat`)
- Sidebar: list of conversations, "New Chat" button
- Main: chat messages (user in red bubble, assistant in dark bubble)
- Message input with send button
- Loading states during AI response

### Profile (`/profile`)
- Edit name and target language
- Skill levels with progress bars
- XP and streak stats

### Auth (`/auth/login`, `/auth/register`)
- Login: email + password form
- Register: name, email, password, confirm password, target language dropdown
- Language list loaded from `/api/v1/languages` (public endpoint)

## Development

```bash
# Install dependencies
npm install

# Development server (port 4200)
npm start

# Production build
npm run build

# The backend expects the SPA on port 4200 (configured in Laravel's SANCTUM_STATEFUL_DOMAINS)
# API base URL: http://localhost:80/api/v1 (configured in src/environments/environment.ts)
```

## Code Conventions

- **All components are standalone** (no NgModules)
- **Interfaces** prefixed with `I` (e.g., `IAuthUseCase`, `IModuleRepository`)
- **Entity interfaces** are plain data shapes (e.g., `User`, `Module`, `Lesson`)
- **Use cases** receive dependencies via `@Inject(TOKEN)` in constructor
- **API adapters** use `@Injectable({ providedIn: 'root' })` since they have concrete dependencies
- **Template + styles** are inline in component files
- **Pages** inject use cases via `@Inject(USE_CASE_TOKEN)` using Angular DI tokens
- **No tests yet** (not generated in minimal scaffold)
