import { Component, Inject, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IVocabularyUseCase } from '../../../core/domain/ports/in';
import { VOCABULARY_USE_CASE } from '../../../di/tokens';
import { UserWord, WordProgress } from '../../../core/domain/entities';

@Component({
  selector: 'app-vocabulary-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page container">
      <h2 class="mb-3">Vocabulary</h2>
      <div class="progress-card card mb-3" *ngIf="wordProgress">
        <div class="flex justify-between mb-2"><span class="text-secondary">Overall Progress</span><span class="text-primary">{{ wordProgress.progress_percentage }}%</span></div>
        <div class="progress-bar"><div class="progress-fill" [style.width.%]="wordProgress.progress_percentage"></div></div>
        <div class="stats-row mt-2"><span>Total: {{ wordProgress.total }}</span><span>Mastered: {{ wordProgress.mastered }}</span><span class="text-warning">Due: {{ wordProgress.due_for_review }}</span></div>
      </div>
      <div class="tabs mb-3"><button class="tab" [class.active]="activeTab === 'review'" (click)="activeTab = 'review'">Review</button><button class="tab" [class.active]="activeTab === 'mastered'" (click)="activeTab = 'mastered'">Mastered</button></div>
      <div class="loading" *ngIf="loading"><div class="spinner" style="width:24px;height:24px;margin:24px auto;"></div></div>
      <div *ngIf="!loading && activeTab === 'review'">
        <div *ngIf="reviewWords.length === 0" class="text-center mt-3"><p class="text-secondary">No words due for review. Great job!</p></div>
        <div class="words-grid" *ngIf="reviewWords.length > 0">
          <div class="word-card card" *ngFor="let uw of reviewWords">
            <div class="flex justify-between items-start"><div><h4 class="word-text">{{ uw.word?.word || 'Unknown' }}</h4><p class="text-secondary" *ngIf="uw.word?.meaning">{{ uw.word?.meaning }}</p><p class="text-muted example" *ngIf="uw.word?.example_sentence">{{ uw.word?.example_sentence }}</p></div><span class="familiarity-badge">Level {{ uw.familiarity }}/5</span></div>
            <div class="flex gap-2 mt-3"><button class="btn btn-outline btn-sm" (click)="reviewWord(uw.id, false)">Still Learning</button><button class="btn btn-primary btn-sm" (click)="reviewWord(uw.id, true)">I Know It</button></div>
          </div>
        </div>
      </div>
      <div *ngIf="!loading && activeTab === 'mastered'">
        <div *ngIf="masteredWords.length === 0" class="text-center mt-3"><p class="text-secondary">No mastered words yet. Keep practicing!</p></div>
        <div class="words-grid" *ngIf="masteredWords.length > 0">
          <div class="word-card card" *ngFor="let uw of masteredWords">
            <div class="flex justify-between items-start"><div><h4 class="word-text">{{ uw.word?.word || 'Unknown' }}</h4><p class="text-secondary" *ngIf="uw.word?.meaning">{{ uw.word?.meaning }}</p><p class="text-muted example" *ngIf="uw.word?.example_sentence">{{ uw.word?.example_sentence }}</p></div><span class="mastered-badge">Mastered</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-card { padding: 20px; }
    .progress-bar { height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 3px; transition: width 0.3s ease; }
    .stats-row { display: flex; gap: 24px; font-size: 13px; color: var(--text-secondary); }
    .tabs { display: flex; gap: 4px; background: var(--bg-secondary); border-radius: var(--radius-md); padding: 4px; width: fit-content; }
    .tab { padding: 8px 20px; background: transparent; color: var(--text-secondary); border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; transition: all 0.2s ease; }
    .tab.active { background: var(--primary); color: #fff; }
    .words-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 12px; }
    .word-card { padding: 20px; }
    .word-text { font-size: 20px; font-weight: 600; }
    .example { font-size: 13px; font-style: italic; margin-top: 6px; }
    .familiarity-badge { padding: 4px 10px; background: rgba(243, 156, 18, 0.15); color: var(--warning); border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; }
    .mastered-badge { padding: 4px 10px; background: rgba(39, 174, 96, 0.15); color: var(--success); border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; }
  `],
})
export class VocabularyPageComponent implements OnInit {
  reviewWords: UserWord[] = [];
  masteredWords: UserWord[] = [];
  wordProgress: WordProgress | null = null;
  loading = true;
  activeTab: 'review' | 'mastered' = 'review';

  constructor(
    @Inject(VOCABULARY_USE_CASE) private readonly vocUseCase: IVocabularyUseCase,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.vocUseCase.getWordsForReview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (w) => { this.reviewWords = w; this.loading = false; this.cdr.detectChanges(); }, error: () => { this.loading = false; this.cdr.detectChanges(); } });
    this.vocUseCase.getMasteredWords()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (w) => { this.masteredWords = w; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
    this.vocUseCase.getProgress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => { this.wordProgress = p; this.cdr.detectChanges(); }, error: () => { this.cdr.detectChanges(); } });
  }

  reviewWord(userWordId: number, wasCorrect: boolean): void {
    this.vocUseCase.reviewWord(userWordId, wasCorrect)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadData(), error: () => {} });
  }
}