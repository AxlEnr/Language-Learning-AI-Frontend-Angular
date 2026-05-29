import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewChecked, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IAIUseCase, IVoiceUseCase } from '../../../core/domain/ports/in';
import { AI_USE_CASE, VOICE_USE_CASE } from '../../../di/tokens';
import { AIConversation, AIConversationResponse, AIConversationsResponse, AIMessage, TTSVoice, PronunciationFeedback } from '../../../core/domain/entities';
import { VoiceRecordingService } from '../../../infrastructure/voice/voice-recording.service';

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
          <div class="chat-header">
            <div class="voice-mode-toggle">
              <label class="toggle-label"><input type="checkbox" [(ngModel)]="voiceMode" (ngModelChange)="onVoiceModeChange($event)" /><span class="toggle-switch"></span><span class="toggle-text">Voice Mode</span></label>
            </div>
          </div>
          <div class="chat-messages" #chatMessages>
            <div *ngIf="loadingMessages" class="text-center mt-2"><div class="spinner" style="margin:0 auto;"></div></div>
            <div *ngFor="let msg of activeConversation.messages; let i = index" class="chat-message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
              <div class="message-bubble">
                <div *ngIf="getMeta(msg, 'recognized_text') as recognized" class="recognized-text">You said: "{{ recognized }}"</div>
                <div>{{ msg.message }}</div>
                <div *ngIf="getMetaNum(msg, 'similarity_score') as score" class="pronunciation-score" [class.good]="score >= 80" [class.ok]="score >= 50 && score < 80" [class.bad]="score < 50">Pronunciation: {{ score }}%</div>
                <div *ngIf="getMeta(msg, 'pronunciation_feedback') as feedback" class="pronunciation-feedback">{{ feedback }}</div>
                <div *ngIf="msg.role === 'assistant' && getMeta(msg, 'audio_url')" class="audio-controls">
                  <button class="btn-audio" (click)="playAudio(getMeta(msg, 'audio_url')!)" [disabled]="playingAudioUrl === getMeta(msg, 'audio_url')">
                    <span *ngIf="playingAudioUrl !== getMeta(msg, 'audio_url')">&#9654;</span>
                    <span *ngIf="playingAudioUrl === getMeta(msg, 'audio_url')">&#9646;&#9646;</span>
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="sending" class="chat-message assistant"><div class="message-bubble"><span class="spinner"></span> {{ voiceMode ? 'Processing voice...' : 'Thinking...' }}</div></div>
          </div>
          <div class="chat-input">
            <ng-container *ngIf="!voiceMode">
              <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Type your message..." [disabled]="sending" />
              <button class="btn btn-primary" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending"><span *ngIf="sending" class="spinner"></span><span *ngIf="!sending">Send</span></button>
            </ng-container>
            <ng-container *ngIf="voiceMode">
              <div class="voice-input-area">
                <button class="btn-mic" [class.recording]="recordingService.isRecording" (mousedown)="startRecording()" (mouseup)="stopRecording()" (mouseleave)="cancelRecordingIfActive()" (touchstart)="startRecording()" (touchend)="stopRecording()" [disabled]="sending">
                  <span *ngIf="!recordingService.isRecording && !sending">&#127908;</span>
                  <span *ngIf="recordingService.isRecording" class="recording-indicator"></span>
                  <span *ngIf="sending" class="spinner"></span>
                </button>
                <span class="voice-hint">{{ recordingService.isRecording ? 'Release to send' : 'Hold to speak' }}</span>
              </div>
            </ng-container>
          </div>
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
    .chat-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .chat-message { display: flex; }
    .chat-message.user { justify-content: flex-end; }
    .chat-message.assistant { justify-content: flex-start; }
    .message-bubble { max-width: 75%; padding: 12px 16px; border-radius: var(--radius-md); font-size: 14px; line-height: 1.5; }
    .chat-message.user .message-bubble { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; }
    .chat-message.assistant .message-bubble { background: var(--bg-surface); color: var(--text-primary); border-bottom-left-radius: 4px; }
    .chat-input { display: flex; gap: 8px; padding: 16px; border-top: 1px solid var(--border); align-items: center; }
    .chat-input input { flex: 1; }
    .conversation-list { display: flex; flex-direction: column; gap: 4px; }
    .conv-item { width: 100%; padding: 10px 12px; text-align: left; background: transparent; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 14px; display: flex; flex-direction: column; gap: 2px; transition: all 0.15s ease; }
    .conv-item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .conv-item.active { background: rgba(192, 57, 43, 0.1); color: var(--primary-light); }
    .toggle-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text-secondary); }
    .toggle-label input { display: none; }
    .toggle-switch { width: 36px; height: 20px; background: var(--bg-hover); border-radius: 10px; position: relative; transition: background 0.2s; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .toggle-label input:checked + .toggle-switch { background: var(--primary); }
    .toggle-label input:checked + .toggle-switch::after { transform: translateX(16px); }
    .toggle-text { user-select: none; }
    .voice-input-area { display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center; }
    .btn-mic { width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-mic:hover { background: rgba(192, 57, 43, 0.1); }
    .btn-mic.recording { background: var(--primary); color: #fff; animation: pulse 1.5s infinite; }
    .btn-mic:disabled { opacity: 0.5; cursor: not-allowed; }
    .recording-indicator { width: 16px; height: 16px; border-radius: 50%; background: #fff; animation: pulse-dot 0.8s infinite alternate; }
    .voice-hint { font-size: 13px; color: var(--text-secondary); }
    .recognized-text { font-size: 12px; color: rgba(255,255,255,0.75); margin-bottom: 4px; font-style: italic; }
    .pronunciation-score { font-size: 12px; margin-top: 6px; padding: 2px 8px; border-radius: 4px; display: inline-block; font-weight: 600; }
    .pronunciation-score.good { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
    .pronunciation-score.ok { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
    .pronunciation-score.bad { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
    .pronunciation-feedback { font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-style: italic; }
    .audio-controls { margin-top: 8px; }
    .btn-audio { background: none; border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; cursor: pointer; color: var(--text-secondary); font-size: 14px; transition: all 0.15s; }
    .btn-audio:hover { background: var(--bg-hover); color: var(--text-primary); }
    .btn-audio:disabled { opacity: 0.5; }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.4); } 50% { box-shadow: 0 0 0 12px rgba(192, 57, 43, 0); } }
    @keyframes pulse-dot { 0% { opacity: 1; } 100% { opacity: 0.4; } }
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
  voiceMode = false;
  playingAudioUrl: string | null = null;
  selectedVoice: TTSVoice = 'alloy';

  constructor(
    @Inject(AI_USE_CASE) private readonly aiUseCase: IAIUseCase,
    @Inject(VOICE_USE_CASE) private readonly voiceUseCase: IVoiceUseCase,
    readonly recordingService: VoiceRecordingService,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) {}

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

  private scrollToBottom(): void { try { const el = this.chatMessagesRef?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch {} }

  onVoiceModeChange(enabled: boolean): void {
    if (enabled) {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        this.voiceMode = false;
        this.cdr.detectChanges();
      });
    }
  }

  newConversation(): void {
    this.creatingNew = true;
    const context = this.voiceMode ? { voice_mode: true } as Record<string, unknown> : undefined;
    this.aiUseCase.startConversation(undefined, undefined, context)
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
    conv.messages.push(this.createUserMessage(msg));
    this.aiUseCase.sendMessage(conv.id, msg)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.pushAssistantMessage(r.response);
          this.sending = false;
          this.cdr.detectChanges();
        }, error: () => { this.sending = false; this.cdr.detectChanges(); }
      });
  }

  async startRecording(): Promise<void> {
    if (this.sending) return;
    try {
      await this.recordingService.startRecording();
      this.cdr.detectChanges();
    } catch {
      this.cdr.detectChanges();
    }
  }

  async stopRecording(): Promise<void> {
    if (!this.recordingService.isRecording || !this.activeConversation) return;
    try {
      const audioBlob = await this.recordingService.stopRecording();
      this.cdr.detectChanges();
      this.sendVoiceMessage(audioBlob);
    } catch {
      this.cdr.detectChanges();
    }
  }

  cancelRecordingIfActive(): void {
    if (this.recordingService.isRecording) {
      this.recordingService.cancelRecording();
      this.cdr.detectChanges();
    }
  }

  private sendVoiceMessage(audio: Blob): void {
    if (!this.activeConversation || this.sending) return;
    this.sending = true;
    const conv = this.activeConversation;
    if (!conv.messages) conv.messages = [];

    this.voiceUseCase.voiceConversation(conv.id, audio, this.selectedVoice)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          conv.messages!.push(this.createUserMessage(result.recognized_text, { recognized_text: result.recognized_text }));
          this.pushAssistantMessage(result.ai_response, {
            audio_url: result.audio_url,
            similarity_score: result.duration,
          });
          this.sending = false;
          this.cdr.detectChanges();
          this.playAudio(result.audio_url);
        },
        error: () => { this.sending = false; this.cdr.detectChanges(); }
      });
  }

  playAudio(url: string | undefined): void {
    if (!url) return;
    const audio = VoiceRecordingService.playAudio(url);
    this.playingAudioUrl = url;
    audio.onended = () => { this.playingAudioUrl = null; this.cdr.detectChanges(); };
    this.cdr.detectChanges();
  }

  private createUserMessage(text: string, metadata: Record<string, unknown> | null = null): AIMessage {
    return {
      id: Date.now(),
      conversation_id: this.activeConversation!.id,
      role: 'user',
      message: text,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private pushAssistantMessage(text: string, metadata: Record<string, unknown> | null = null): void {
    if (!this.activeConversation) return;
    if (!this.activeConversation.messages) this.activeConversation.messages = [];
    this.activeConversation.messages.push({
      id: Date.now() + 1,
      conversation_id: this.activeConversation.id,
      role: 'assistant',
      message: text,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  getMeta(msg: AIMessage, key: string): string | null {
    const val = msg.metadata?.[key];
    return typeof val === 'string' ? val : null;
  }

  getMetaNum(msg: AIMessage, key: string): number | null {
    const val = msg.metadata?.[key];
    return typeof val === 'number' ? val : null;
  }
}
