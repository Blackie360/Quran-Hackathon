import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  // Using alquran.cloud API - free and public
  private apiUrl = 'https://api.alquran.cloud/v1';

  constructor(private http: HttpClient) {}

  getChapters(language: string = 'en'): Observable<any> {
    return this.http.get(`${this.apiUrl}/surah`);
  }

  getChapter(id: number, language: string = 'en'): Observable<any> {
    return this.http.get(`${this.apiUrl}/surah/${id}`);
  }

  getChapterVerses(chapterId: number, edition: string = 'quran-uthmani'): Observable<any> {
    return this.http.get(`${this.apiUrl}/surah/${chapterId}/${edition}`);
  }

  searchVerses(query: string, size: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?q=${query}&size=${size}`);
  }

  getTranslations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/edition?format=json&type=translation&language=en`);
  }

  getChapterVersesWithTranslation(
    chapterId: number,
    edition: string = 'en.sahih',
    arabicEdition: string = 'quran-uthmani'
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/surah/${chapterId}?editions=${arabicEdition},${edition}`
    );
  }

  getEditions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/edition`);
  }
}

