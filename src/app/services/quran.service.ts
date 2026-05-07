import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Chapter {
  id: number;
  name: string;
  transliteration?: string;
  translated_name?: string;
  englishName?: string;
  englishNameTranslation?: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Verse {
  id: string;
  chapter_id?: number;
  chapterNumber?: number;
  verse_number?: number;
  numberInSurah?: number;
  text?: string;
  text_uthmani?: string;
  text_indopak?: string;
  translations?: Array<{
    id: number;
    text: string;
    resource_id: number;
    resource_name: string;
  }>;
}

export interface Translator {
  id: number;
  name: string;
  author_name: string;
  language_name: string;
  translated_name?: {
    name: string;
    language_name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuranService {
  // Using public Quran.com API
  private apiUrl = 'https://api.quran.com/api/v4';

  constructor(private http: HttpClient) {}

  getChapters(language: string = 'en'): Observable<any> {
    return this.http.get(`${this.apiUrl}/chapters`);
  }

  getChapter(id: number, language: string = 'en'): Observable<any> {
    return this.http.get(`${this.apiUrl}/chapters/${id}`);
  }

  getChapterVerses(chapterId: number, edition: string = 'quran-uthmani'): Observable<any> {
    return this.http.get(`${this.apiUrl}/verses/by_chapter/${chapterId}?language=en&words=false&translations=false&audio=false&tafsirs=false&word_fields=text_uthmani&page=1&per_page=50`);
  }

  searchVerses(query: string, size: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?q=${query}&size=${size}`);
  }

  getTranslations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resources/translations`);
  }

  getChapterVersesWithTranslation(
    chapterId: number,
    edition: string = '20', // English translation ID
    arabicEdition: string = 'quran-uthmani'
  ): Observable<any> {
    // Get verses with translation
    return this.http.get(`${this.apiUrl}/verses/by_chapter/${chapterId}?language=en&words=false&translations=${edition}&audio=false&tafsirs=false&page=1&per_page=50`);
  }

  getEditions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resources/translations`);
  }
}

