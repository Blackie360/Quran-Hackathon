import { Injectable } from '@angular/core';

export interface StudyVerse {
  verseKey: string;
  chapterId: number;
  verseNumber: number;
  chapterName?: string;
  arabicText?: string;
  translation?: string;
  savedAt: string;
}

export interface StudyNote extends StudyVerse {
  note: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudyStorageService {
  private readonly bookmarksKey = 'tarjuman.bookmarks';
  private readonly notesKey = 'tarjuman.notes';
  private readonly historyKey = 'tarjuman.history';

  getBookmarks(): StudyVerse[] {
    return this.read<StudyVerse[]>(this.bookmarksKey, []);
  }

  isBookmarked(verseKey: string): boolean {
    return this.getBookmarks().some((bookmark) => bookmark.verseKey === verseKey);
  }

  toggleBookmark(verse: StudyVerse): boolean {
    const bookmarks = this.getBookmarks();
    const exists = bookmarks.some((bookmark) => bookmark.verseKey === verse.verseKey);
    const next = exists
      ? bookmarks.filter((bookmark) => bookmark.verseKey !== verse.verseKey)
      : [{ ...verse, savedAt: new Date().toISOString() }, ...bookmarks];

    this.write(this.bookmarksKey, next);
    return !exists;
  }

  getNotes(): StudyNote[] {
    return this.read<StudyNote[]>(this.notesKey, []);
  }

  getNote(verseKey: string): string {
    return this.getNotes().find((note) => note.verseKey === verseKey)?.note || '';
  }

  saveNote(verse: StudyVerse, note: string): void {
    const notes = this.getNotes().filter((item) => item.verseKey !== verse.verseKey);
    const trimmed = note.trim();

    if (trimmed) {
      notes.unshift({
        ...verse,
        note: trimmed,
        savedAt: new Date().toISOString()
      });
    }

    this.write(this.notesKey, notes);
  }

  getHistory(): StudyVerse[] {
    return this.read<StudyVerse[]>(this.historyKey, []);
  }

  addHistory(verse: StudyVerse): void {
    const history = this.getHistory().filter((item) => item.verseKey !== verse.verseKey);
    history.unshift({ ...verse, savedAt: new Date().toISOString() });
    this.write(this.historyKey, history.slice(0, 30));
  }

  clearHistory(): void {
    this.write(this.historyKey, []);
  }

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
