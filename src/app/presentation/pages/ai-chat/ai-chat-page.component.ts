import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewChecked, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IAIUseCase } from '../../../core/domain/ports/in';
import { AI_USE_CASE } from '../../../di/tokens';
import { AIConversation, AIConversationResponse, AIConversationsResponse } from '../../../core/domain/entities';

@Component({
  selector: 'app-ai-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page container"><div class="chat-layout">
      <div class="chat-sidebar">
        <h3 class="mb-2">Conversations</h3>
        <button class="btn btn-primary btn-sm mb-2" (click)="newConversation()" [disabled]="creatingNew"><span *ngIf="creatingNew" class="spinner"></span> New Chat</button>
        <div class="conversation-list" *ngIf="conversations.length > 0">
          <button *ngFor="let conv of conversations" class="conv-item" [class.active]="activeConversation?.id === conv.id" (click)="selectConversation(conv)"><span>Chat #{{ conv.id }}</span><span class="text-muted" style="font-size:12px;">{{ conv.created_at | date:'short' }}</span></button>
        </div>
        <p class="text-muted mt-2" *ngIf="conversations.length === 0" style="font-size:13px;">No conversations yet.</p>
      </div>
      <div class="chat-main">
        <div *ngIf="!activeConversation" class="chat-placeholder"><div class="text-center"><h3 class="mb-2">AI Language Tutor</h3><p class="text-secondary mb-3">Practice conversations with an AI tutor.</p><button class="btn btn-primary" (click)="newConversation()" [disabled]="creatingNew">Start Conversation</button></div></div>
        <div *ngIf="activeConversation" class="chat-view">
          <div class="chat-messages" #chatMessages>
            <div *ngIf="loadingMessages" class="text-center mt-2"><div class="spinner" style="margin:0 auto;"></div></div>
            <div *ngFor="let msg of activeConversation.messages" class="chat-message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'"><div class="message-bubble">{{ msg.message }}</div></div>
            <div *ngIf="sending" class="chat-message assistant"><div class="message-bubble"><span class="spinner"></span> Thinking...</div></div>
          </div>
          <div class="chat-input"><input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Type your message..." [disabled]="sending" /><button class="btn btn-primary" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending"><span *ngIf="sending" class="spinner"></span><span *ngIf="!sending">Send</span></button></div>
        </div>
      </div>
    </div></div>
  `,
  styles: [`
    .chat-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; height: calc(100vh - 96px); }
    .chat-sidebar { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; overflow-y: auto; }
    .chat-main { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; }
    .chat-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
    .chat-view { display: flex; flex-direction: column; height: 100%; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .chat-message { display: flex; }
    .chat-message.user { justify-content: flex-end; }
    .chat-message.assistant { justify-content: flex-start; }
    .message-bubble { max-width: 75%; padding: 12px 16px; border-radius: var(--radius-md); font-size: 14px; line-height: 1.5; }
    .chat-message.user .message-bubble { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; }
    .chat-message.assistant .message-bubble { background: var(--bg-surface); color: var(--text-primary); border-bottom-left-radius: 4px; }
    .chat-input { display: flex; gap: 8px; padding: 16px; border-top: 1px solid var(--border); }
    .chat-input input { flex: 1; }
    .conversation-list { display: flex; flex-direction: column; gap: 4px; }
    .conv-item { width: 100%; padding: 10px 12px; text-align: left; background: transparent; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 14px; display: flex; flex-direction: column; gap: 2px; transition: all 0.15s ease; }
    .conv-item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .conv-item.active { background: rgba(192, 57, 43, 0.1); color: var(--primary-light); }
  `],
})
export class AIChatPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef;
  conversations: AIConversation[] = [];
  activeConversation: AIConversation | null = null;
  newMessage = '';
  sending = false;
  creatingNew = false;
  loadingMessages = false;

  constructor(
    @Inject(AI_USE_CASE) private readonly aiUseCase: IAIUseCase,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.aiUseCase.listConversations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: AIConversationsResponse) => {
          this.conversations = response.conversations;
          this.cdr.detectChanges();
        }, error: () => {
          this.cdr.detectChanges();
        }
      });
  }

  ngAfterViewChecked(): void { this.scrollToBottom(); }

  private scrollToBottom(): void { try { const el = this.chatMessagesRef?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch { } }

  newConversation(): void {
    this.creatingNew = true;
    this.aiUseCase.startConversation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => { this.conversations.unshift(c); this.selectConversation(c); this.creatingNew = false; this.cdr.detectChanges(); }, error: () => { this.creatingNew = false; this.cdr.detectChanges(); } });
  }

  selectConversation(conv: AIConversation): void {
    this.loadingMessages = true;
    this.activeConversation = conv;
    this.aiUseCase.getConversation(conv.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: AIConversationResponse) => {
          this.activeConversation = response.conversation;
          this.loadingMessages = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loadingMessages = false; this.cdr.detectChanges(); }
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeConversation || this.sending) return;
    const msg = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;
    const conv = this.activeConversation;
    if (!conv.messages) conv.messages = [];
    conv.messages.push({ id: 0, conversation_id: conv.id, role: 'user', message: msg, metadata: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    this.aiUseCase.sendMessage(conv.id, msg)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          if (!this.activeConversation) this.activeConversation = conv;
          if (!this.activeConversation.messages) this.activeConversation.messages = [];
          this.activeConversation.messages.push({ id: 0, conversation_id: conv.id, role: 'assistant', message: r.response, metadata: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
          this.sending = false;
          this.cdr.detectChanges();
        }, error: () => { this.sending = false; this.cdr.detectChanges(); }
      });
  }
}