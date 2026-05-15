import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiAiService } from '../../services/gemini-ai.service';

@Component({
  selector: 'app-ai-interpretation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="interpretation-container" *ngIf="show">
      <div class="interpretation-header">
        <div class="header-left">
          <i class="fas fa-sparkles"></i>
          <h3>AI Interpretation</h3>
        </div>
        <button class="close-btn" (click)="close()" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="interpretation-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Getting AI interpretation...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isLoading" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button class="btn btn-small" (click)="retry()">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>

        <!-- Content State -->
        <div *ngIf="!isLoading && !error && interpretation" class="interpretation-text">
          {{ interpretation }}
        </div>

        <!-- No API Key State -->
        <div *ngIf="showApiKeyPrompt" class="api-key-prompt">
          <i class="fas fa-key"></i>
          <p>Enable AI interpretation by setting up your Gemini API key</p>
          <button class="btn btn-primary" (click)="requestApiKey()">
            <i class="fas fa-cog"></i> Configure API Key
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interpretation-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      color: white;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .interpretation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header-left {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .header-left i {
      font-size: 20px;
    }

    .header-left h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .interpretation-content {
      font-size: 14px;
      line-height: 1.6;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-state p {
      margin: 0;
      opacity: 0.9;
    }

    .error-state {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .error-state i {
      font-size: 24px;
      margin-bottom: 8px;
      display: block;
    }

    .error-state p {
      margin: 0 0 12px 0;
    }

    .interpretation-text {
      background: rgba(255, 255, 255, 0.1);
      padding: 16px;
      border-radius: 8px;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 500px;
      overflow-y: auto;
    }

    .interpretation-text::-webkit-scrollbar {
      width: 6px;
    }

    .interpretation-text::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .interpretation-text::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .api-key-prompt {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .api-key-prompt i {
      font-size: 28px;
      margin-bottom: 12px;
      display: block;
    }

    .api-key-prompt p {
      margin: 0 0 16px 0;
      font-size: 14px;
    }

    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }

    .btn-primary {
      background: white;
      color: #667eea;
    }

    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .btn-small {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .btn-small:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class AiInterpretationComponent implements OnInit, OnChanges {
  @Input() verseText: string = '';
  @Input() verseKey: string = '';
  @Input() translation: string = '';
  @Input() show: boolean = false;

  @Output() apiKeyNeeded = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  interpretation: string = '';
  isLoading = false;
  error: string | null = null;
  showApiKeyPrompt = false;

  private geminiAi = inject(GeminiAiService);

  ngOnInit(): void {
    this.checkApiKey();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue && this.show) {
      this.loadInterpretation();
    }
  }

  private checkApiKey(): void {
    if (!this.geminiAi.hasApiKey()) {
      this.showApiKeyPrompt = true;
    }
  }

  private loadInterpretation(): void {
    if (!this.geminiAi.hasApiKey()) {
      this.showApiKeyPrompt = true;
      return;
    }

    if (!this.verseText) {
      this.error = 'No verse text provided';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.interpretation = '';

    this.geminiAi.interpretVerse(this.verseText, this.verseKey, this.translation).subscribe({
      next: (response) => {
        this.interpretation = this.geminiAi.parseResponse(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting interpretation:', error);
        this.isLoading = false;
        this.error = error.error?.error?.message || 'Failed to get interpretation. Please check your API key and try again.';
      }
    });
  }

  retry(): void {
    this.loadInterpretation();
  }

  close(): void {
    this.show = false;
    this.closed.emit();
  }

  requestApiKey(): void {
    this.apiKeyNeeded.emit();
  }
}
