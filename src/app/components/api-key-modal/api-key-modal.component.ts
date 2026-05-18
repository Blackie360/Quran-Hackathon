import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiAiService } from '../../services/gemini-ai.service';

@Component({
  selector: 'app-api-key-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Configure Gemini API Key</h2>
          <button class="close-btn" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p class="info-text">
            <i class="fas fa-info-circle"></i>
            To enable AI interpretation of verses, you need a Gemini API key from Google.
          </p>

          <div class="steps">
            <h3>How to get your API key:</h3>
            <ol>
              <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
              <li>Click "Get API Key" button</li>
              <li>Create a new free API key</li>
              <li>Copy and paste it below</li>
            </ol>
          </div>

          <div class="form-group">
            <label for="apiKey">Gemini API Key:</label>
            <input
              type="password"
              id="apiKey"
              [(ngModel)]="apiKeyInput"
              placeholder="Enter your Gemini API key"
              class="api-input"
            />
            <small class="help-text">
              <i class="fas fa-lock"></i> Your API key is stored locally in your browser
            </small>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i> {{ successMessage }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="saveApiKey()" [disabled]="!apiKeyInput.trim()">
            <i class="fas fa-save"></i> Save API Key
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .modal-body {
      padding: 24px;
    }

    .info-text {
      background: #f0f4ff;
      border-left: 4px solid #4f46e5;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      color: #1e40af;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .info-text i {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .steps {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .steps h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #1f2937;
      font-size: 14px;
      font-weight: 600;
    }

    .steps ol {
      margin: 0;
      padding-left: 20px;
      color: #4b5563;
      font-size: 14px;
    }

    .steps li {
      margin-bottom: 8px;
    }

    .steps a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
    }

    .steps a:hover {
      text-decoration: underline;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #1f2937;
      font-size: 14px;
    }

    .api-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-family: monospace;
      transition: border-color 0.2s;
    }

    .api-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .help-text {
      display: flex;
      gap: 6px;
      align-items: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 6px;
    }

    .error-message {
      background: #fee2e2;
      color: #991b1b;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .error-message i {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .success-message {
      background: #dcfce7;
      color: #166534;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .success-message i {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .btn-primary {
      background: #4f46e5;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #4338ca;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #1f2937;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }
  `]
})
export class ApiKeyModalComponent {
  @Output() apiKeySaved = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();

  isOpen = false;
  apiKeyInput = '';
  errorMessage = '';
  successMessage = '';
  private geminiAi = inject(GeminiAiService);

  openModal(): void {
    this.isOpen = true;
    this.apiKeyInput = this.geminiAi.getApiKey();
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.isOpen = false;
    this.modalClosed.emit();
  }

  saveApiKey(): void {
    const key = this.apiKeyInput.trim();
    
    if (!key) {
      this.errorMessage = 'Please enter a valid API key';
      return;
    }

    try {
      this.geminiAi.setApiKey(key);
      this.successMessage = 'API key saved successfully!';
      this.apiKeySaved.emit(key);
      
      setTimeout(() => {
        this.closeModal();
      }, 1000);
    } catch (error) {
      this.errorMessage = 'Failed to save API key';
    }
  }
}
