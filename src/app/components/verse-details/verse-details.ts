import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuranService } from '../../services/quran.service';
import { StudyStorageService, StudyVerse } from '../../services/study-storage.service';
import { AiInterpretationComponent } from '../ai-interpretation/ai-interpretation.component';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { GeminiAiService } from '../../services/gemini-ai.service';

@Component({
  selector: 'app-verse-details',
  standalone: true,
  imports: [CommonModule, FormsModule, AiInterpretationComponent, ApiKeyModalComponent],
  templateUrl: './verse-details.html',
  styleUrl: './verse-details.css'
})
export class VerseDetails implements OnInit {
  @ViewChild(ApiKeyModalComponent) apiKeyModal!: ApiKeyModalComponent;

  chapterId = 0;
  verseNumber = 0;
  chapterName = '';
  verse: any = null;
  note = '';
  isLoading = true;
  error: string | null = null;
  showAiInterpretation = false;

  constructor(
    private quranService: QuranService,
    private studyStorage: StudyStorageService,
    private geminiAi: GeminiAiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chapterId = Number(params['chapterId']);
      this.verseNumber = Number(params['verseNumber']);

      if (!Number.isInteger(this.chapterId) || this.chapterId < 1 || this.chapterId > 114 || !Number.isInteger(this.verseNumber) || this.verseNumber < 1) {
        this.error = 'Verse not found.';
        this.isLoading = false;
        return;
      }

      this.load();
    });
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.quranService.getChapter(this.chapterId).subscribe({
      next: (response: any) => {
        this.chapterName = response.chapter?.name_simple || `Chapter ${this.chapterId}`;
        this.cdr.detectChanges();
      }
    });

    this.quranService.getChapterVersesWithTranslation(this.chapterId, '20').subscribe({
      next: (response: any) => {
        const found = (response.verses || []).find((verse: any) => verse.verse_number === this.verseNumber);

        if (!found) {
          this.error = 'Verse not found in this chapter.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.verse = this.mapVerse(found);
        this.note = this.studyStorage.getNote(this.verse.verseKey);
        this.studyStorage.addHistory(this.toStudyVerse());
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading verse detail:', err);
        this.error = 'Failed to load verse details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isBookmarked(): boolean {
    return this.verse ? this.studyStorage.isBookmarked(this.verse.verseKey) : false;
  }

  toggleBookmark(): void {
    if (!this.verse) return;
    this.studyStorage.toggleBookmark(this.toStudyVerse());
  }

  saveNote(): void {
    if (!this.verse) return;
    this.studyStorage.saveNote(this.toStudyVerse(), this.note);
  }

  goBack(): void {
    this.router.navigate(['/verses', this.chapterId]);
  }

  toggleAiInterpretation(): void {
    this.showAiInterpretation = !this.showAiInterpretation;
  }

  requestApiKey(): void {
    this.apiKeyModal.openModal();
  }

  onApiKeySaved(): void {
    // The API key has been saved, so the interpretation component will work now
  }

  private mapVerse(verse: any): any {
    return {
      verseKey: verse.verse_key,
      numberInSurah: verse.verse_number,
      text: (verse.text_uthmani || '').trim(),
      translation: this.cleanText(verse.translations?.[0]?.text || ''),
      audioUrl: verse.audio?.url ? `https://verses.quran.com/${verse.audio.url}` : '',
      words: (verse.words || [])
        .filter((word: any) => word.char_type_name === 'word')
        .map((word: any) => ({
          text: word.text || '',
          translation: this.cleanText(word.translation?.text || ''),
          transliteration: this.cleanText(word.transliteration?.text || '')
        }))
    };
  }

  private toStudyVerse(): StudyVerse {
    return {
      verseKey: this.verse.verseKey,
      chapterId: this.chapterId,
      verseNumber: this.verse.numberInSurah,
      chapterName: this.chapterName,
      arabicText: this.verse.text,
      translation: this.verse.translation,
      savedAt: new Date().toISOString()
    };
  }

  private cleanText(value: string): string {
    return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
}
