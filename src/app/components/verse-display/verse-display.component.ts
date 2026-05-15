import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuranService } from '../../services/quran.service';

@Component({
  selector: 'app-verse-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verse-display.component.html',
  styleUrl: './verse-display.component.css'
})
export class VerseDisplayComponent implements OnInit {
  chapterId: number = 0;
  chapterName: string = '';
  verses: any[] = [];
  filteredVerses: any[] = [];
  translations: any[] = [];
  selectedTranslation: string = '20'; // Saheeh International translation resource ID
  searchQuery: string = '';
  isLoading = true;
  isLoadingTranslations = true;
  error: string | null = null;
  arabicVerses: any[] = [];

  constructor(
    private quranService: QuranService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chapterId = Number(params['chapterId']);
      this.loadChapter();
      this.loadVerses();
    });
    this.loadTranslations();
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

  loadVerses(): void {
    this.quranService.getChapterVerses(this.chapterId, 'quran-uthmani').subscribe({
      next: (response: any) => {
        if (Array.isArray(response.verses)) {
          this.arabicVerses = response.verses.map((verse: any) => this.mapVerse(verse));
          this.verses = this.arabicVerses;
          this.filteredVerses = this.verses;
          // Load with translation
          this.loadVersesWithTranslation();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load verses. Please try again.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  loadVersesWithTranslation(): void {
    const arabicEdition = 'quran-uthmani';
    this.quranService
      .getChapterVersesWithTranslation(this.chapterId, this.selectedTranslation, arabicEdition)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.verses)) {
            this.verses = response.verses.map((verse: any) => this.mapVerse(verse));
            this.filteredVerses = this.verses;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading verses with translation:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadTranslations(): void {
    this.quranService.getEditions().subscribe({
      next: (response: any) => {
        if (Array.isArray(response.translations)) {
          // Filter for English translations only
          this.translations = response.translations.filter(
            (translation: any) => translation.language_name === 'english'
          );
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
    // Reload verses with new translation
    this.isLoading = true;
    this.loadVersesWithTranslation();
  }

  searchVerses(): void {
    if (!this.searchQuery.trim()) {
      this.filteredVerses = this.verses;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredVerses = this.verses.filter(verse => {
      const arabicText = (verse.text || '').toLowerCase();
      const translation = (verse.translation || '').toLowerCase();
      return arabicText.includes(query) || translation.includes(query);
    });
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredVerses = this.verses;
  }

  goBack(): void {
    this.router.navigate(['/chapters']);
  }

  getTranslationText(verse: any): string {
    // Use the translation property from combined API response
    return verse.translation || 'Translation not available';
  }

  getArabicText(verse: any): string {
    return verse.text || 'Text not available';
  }

  private mapVerse(verse: any): any {
    return {
      ...verse,
      numberInSurah: verse.verse_number,
      text: verse.text_uthmani || verse.text_indopak || verse.text || '',
      translation: verse.translations?.[0]?.text || ''
    };
  }
}
