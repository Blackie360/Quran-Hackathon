import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService {
  private readonly aiApiUrl = '/ai-api/gemini';

  constructor(private http: HttpClient) {}

  setApiKey(apiKey: string): void {
    console.warn('Gemini API keys are configured on the backend and are not stored in the browser.');
  }

  getApiKey(): string {
    return '';
  }

  hasApiKey(): boolean {
    return true;
  }

  clearApiKey(): void {
    localStorage.removeItem('gemini_api_key');
  }

  interpretVerse(verseText: string, verseKey: string, translation?: string): Observable<any> {
    return this.http.post<any>(
      `${this.aiApiUrl}/interpret`,
      {
        verseText,
        verseKey,
        translation
      }
    ).pipe(
      catchError(error => {
        console.error('Error calling Gemini API:', error);
        throw error;
      })
    );
  }

  translateVerseToEnglish(verseText: string, verseKey: string): Observable<any> {
    return this.http.post<any>(
      `${this.aiApiUrl}/translate`,
      {
        verseText,
        verseKey
      }
    ).pipe(
      catchError(error => {
        console.error('Error calling Gemini API:', error);
        throw error;
      })
    );
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
