import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService {
  private readonly STORAGE_KEY = 'gemini_api_key';
  private readonly apiKey$ = new BehaviorSubject<string>(environment.geminiApiKey || '');
  private readonly GEMINI_API_URL = environment.geminiModelUrl;

  constructor(private http: HttpClient) {
    if (!this.apiKey$.value) {
      this.loadApiKeyFromStorage();
    }
  }

  setApiKey(apiKey: string): void {
    if (apiKey) {
      this.apiKey$.next(apiKey);
      localStorage.setItem(this.STORAGE_KEY, apiKey);
    }
  }

  getApiKey(): string {
    return this.apiKey$.value;
  }

  hasApiKey(): boolean {
    return !!this.apiKey$.value;
  }

  clearApiKey(): void {
    this.apiKey$.next('');
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadApiKeyFromStorage(): void {
    const storedKey = localStorage.getItem(this.STORAGE_KEY);
    if (storedKey) {
      this.apiKey$.next(storedKey);
    }
  }

  interpretVerse(verseText: string, verseKey: string, translation?: string): Observable<any> {
    if (!this.apiKey$.value) {
      throw new Error('Gemini API key not set');
    }

    const prompt = this.buildPrompt(verseText, verseKey, translation);

    return this.http.post<any>(
      `${this.GEMINI_API_URL}?key=${encodeURIComponent(this.apiKey$.value)}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    ).pipe(
      catchError(error => {
        console.error('Error calling Gemini API:', error);
        throw error;
      })
    );
  }

  private buildPrompt(verseText: string, verseKey: string, translation?: string): string {
    const translationText = translation ? `\n\nEnglish Translation:\n${translation}` : '';

    return `You are an Islamic scholar and Quran interpreter. Provide a comprehensive but concise interpretation of the following Quranic verse:

Verse Reference: ${verseKey}
Arabic Text: ${verseText}${translationText}

Please provide:
1. **Context**: Historical and contextual background
2. **Meaning**: Deep explanation of the verse's meaning
3. **Key Themes**: Main themes and concepts
4. **Spiritual Lesson**: What Muslims can learn from this verse
5. **Modern Application**: How this verse applies to contemporary life

Keep the response clear, respectful, and academically sound. Use simple language while maintaining depth.`;
  }

 
  parseResponse(response: any): string {
    try {
      if (response.candidates && response.candidates.length > 0) {
        const content = response.candidates[0].content;
        if (content.parts && content.parts.length > 0) {
          return content.parts[0].text;
        }
      }
      return 'No interpretation available';
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return 'Error processing interpretation';
    }
  }
}
