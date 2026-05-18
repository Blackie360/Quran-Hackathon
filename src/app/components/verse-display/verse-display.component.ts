import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuranService } from '../../services/quran.service';
import { StudyStorageService, StudyVerse } from '../../services/study-storage.service';
import { AiInterpretationComponent } from '../ai-interpretation/ai-interpretation.component';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { GeminiAiService } from '../../services/gemini-ai.service';

interface DisplayWord {
  text: string;
  translation: string;
  transliteration: string;
}

interface DisplayVerse {
  id: number;
  verseKey: string;
  numberInSurah: number;
  text: string;
  translation: string;
  audioUrl: string;
  words: DisplayWord[];
  note: string;
  showWords: boolean;
  showNote: boolean;
  showAiInterpretation?: boolean;
  showAiTranslation?: boolean;
}

@Component({
  selector: 'app-verse-display',
  standalone: true,
  imports: [CommonModule, FormsModule, AiInterpretationComponent, ApiKeyModalComponent],
  templateUrl: './verse-display.component.html',
  styleUrl: './verse-display.component.css'
})
export class VerseDisplayComponent implements OnInit {
  @ViewChild(ApiKeyModalComponent) apiKeyModal!: ApiKeyModalComponent;
  chapterId = 0;
  chapterName = '';
  verses: DisplayVerse[] = [];
  filteredVerses: DisplayVerse[] = [];
  translations: any[] = [];
  selectedTranslation = '20'; // Saheeh International translation resource ID
  searchQuery = '';
  isLoading = true;
  isLoadingTranslations = true;
  error: string | null = null;
  chapterAudioUrl = '';

  constructor(
    private quranService: QuranService,
    private studyStorage: StudyStorageService,
    private geminiAi: GeminiAiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chapterId = Number(params['chapterId']);

      if (!Number.isInteger(this.chapterId) || this.chapterId < 1 || this.chapterId > 114) {
        this.chapterName = 'Invalid chapter';
        this.error = 'Chapter not found. Choose a chapter between 1 and 114.';
        this.isLoading = false;
        this.isLoadingTranslations = false;
        this.cdr.detectChanges();
        return;
      }

      this.loadChapter();
      this.loadChapterAudio();
      this.loadTranslations();
      this.loadVersesWithTranslation();
    });
  }

  loadChapter(): void {
    this.quranService.getChapter(this.chapterId, 'en').subscribe({
      next: (response: any) => {
        if (response.chapter) {
          this.chapterName = response.chapter.name_simple || response.chapter.name_arabic;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading chapter:', err);
      }
    });
  }

  loadChapterAudio(): void {
    this.quranService.getChapterAudio(this.chapterId).subscribe({
      next: (response: any) => {
        this.chapterAudioUrl = response.audio_file?.audio_url || '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading chapter audio:', err);
      }
    });
  }

  loadVersesWithTranslation(): void {
    this.isLoading = true;
    this.error = null;

    this.quranService
      .getChapterVersesWithTranslation(this.chapterId, this.selectedTranslation)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.verses)) {
            this.verses = response.verses.map((verse: any) => this.mapVerse(verse));
            this.filteredVerses = this.verses;
          } else {
            this.error = 'Unexpected verse data from server.';
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading verses with translation:', err);
          this.error = 'Failed to load verses. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadTranslations(): void {
    this.quranService.getEditions().subscribe({
      next: (response: any) => {
        if (Array.isArray(response.translations)) {
          this.translations = response.translations.filter(
            (translation: any) => translation.language_name === 'english'
          );
        }

        if (!this.translations.some((translation) => String(translation.id) === String(this.selectedTranslation))) {
          this.selectedTranslation = String(this.translations[0]?.id || '20');
        }

        this.isLoadingTranslations = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading translations:', err);
        this.isLoadingTranslations = false;
        this.cdr.detectChanges();
      }
    });
  }

  onTranslationChange(): void {
    this.loadVersesWithTranslation();
  }

  searchVerses(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredVerses = this.verses;
      this.cdr.detectChanges();
      return;
    }

    this.filteredVerses = this.verses.filter(verse => {
      const arabicText = verse.text.toLowerCase();
      const translation = verse.translation.toLowerCase();
      const words = verse.words.map((word) => `${word.translation} ${word.transliteration}`).join(' ').toLowerCase();
      return arabicText.includes(query) || translation.includes(query) || words.includes(query);
    });
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredVerses = this.verses;
    this.cdr.detectChanges();
  }

  toggleWords(verse: DisplayVerse): void {
    verse.showWords = !verse.showWords;
  }

  toggleNote(verse: DisplayVerse): void {
    verse.showNote = !verse.showNote;
  }

  toggleBookmark(verse: DisplayVerse): void {
    this.studyStorage.toggleBookmark(this.toStudyVerse(verse));
    this.cdr.detectChanges();
  }

  isBookmarked(verse: DisplayVerse): boolean {
    return this.studyStorage.isBookmarked(verse.verseKey);
  }

  saveNote(verse: DisplayVerse): void {
    this.studyStorage.saveNote(this.toStudyVerse(verse), verse.note);
  }

  openVerse(verse: DisplayVerse): void {
    this.studyStorage.addHistory(this.toStudyVerse(verse));
    this.router.navigate(['/verses', this.chapterId, verse.numberInSurah]);
  }

  goBack(): void {
    this.router.navigate(['/chapters']);
  }

  goToSearch(): void {
    this.router.navigate(['/search']);
  }

  goToStudy(): void {
    this.router.navigate(['/study']);
  }

  getTranslationText(verse: DisplayVerse): string {
    return verse.translation || 'Translation not available';
  }

  private mapVerse(verse: any): DisplayVerse {
    const verseKey = verse.verse_key || `${this.chapterId}:${verse.verse_number}`;
    const translation = this.cleanText(verse.translations?.[0]?.text || '');

    return {
      id: verse.id,
      verseKey,
      numberInSurah: verse.verse_number,
      text: (verse.text_uthmani || verse.text_indopak || verse.text || '').trim(),
      translation,
      audioUrl: verse.audio?.url ? `https://verses.quran.com/${verse.audio.url}` : '',
      words: (verse.words || [])
        .filter((word: any) => word.char_type_name === 'word')
        .map((word: any) => ({
          text: word.text || '',
          translation: this.cleanText(word.translation?.text || ''),
          transliteration: this.cleanText(word.transliteration?.text || '')
        })),
      note: this.studyStorage.getNote(verseKey),
      showWords: false,
      showNote: false
    };
  }

  private toStudyVerse(verse: DisplayVerse): StudyVerse {
    return {
      verseKey: verse.verseKey,
      chapterId: this.chapterId,
      verseNumber: verse.numberInSurah,
      chapterName: this.chapterName || `Chapter ${this.chapterId}`,
      arabicText: verse.text,
      translation: verse.translation,
      savedAt: new Date().toISOString()
    };
  }

  private cleanText(value: string): string {
    return value
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  toggleAiInterpretation(verse: DisplayVerse): void {
    verse.showAiInterpretation = !verse.showAiInterpretation;
  }

  toggleAiTranslation(verse: DisplayVerse): void {
    verse.showAiTranslation = !verse.showAiTranslation;
  }

  requestApiKey(): void {
    this.apiKeyModal.openModal();
  }

  onApiKeySaved(): void {
    // The API key has been saved, so the interpretation component will work now
  }
}
