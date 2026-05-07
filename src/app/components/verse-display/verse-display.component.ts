import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuranService, Verse } from '../../services/quran.service';

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
  selectedTranslation: string = 'en.sahih'; // Default English translation
  searchQuery: string = '';
  isLoading = true;
  isLoadingTranslations = true;
  error: string | null = null;
  arabicVerses: any[] = [];

  constructor(
    private quranService: QuranService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chapterId = params['chapterId'];
      this.loadChapter();
      this.loadVerses();
    });
    this.loadTranslations();
  }

  loadChapter(): void {
    this.quranService.getChapter(this.chapterId, 'en').subscribe({
      next: (response: any) => {
        if (response.data) {
          this.chapterName = response.data.englishName || response.data.name;
        }
      },
      error: (err) => {
        console.error('Error loading chapter:', err);
      }
    });
  }

  loadVerses(): void {
    this.quranService.getChapterVerses(this.chapterId, 'quran-uthmani').subscribe({
      next: (response: any) => {
        if (response.data && response.data.ayahs) {
          this.arabicVerses = response.data.ayahs;
          this.verses = this.arabicVerses;
          this.filteredVerses = this.verses;
          // Load with translation
          this.loadVersesWithTranslation();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load verses. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadVersesWithTranslation(): void {
    const arabicEdition = 'quran-uthmani';
    this.quranService
      .getChapterVersesWithTranslation(this.chapterId, this.selectedTranslation, arabicEdition)
      .subscribe({
        next: (response: any) => {
          if (response.data && response.data.ayahs) {
            this.verses = response.data.ayahs;
            this.filteredVerses = this.verses;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading verses with translation:', err);
          this.isLoading = false;
        }
      });
  }

  loadTranslations(): void {
    this.quranService.getEditions().subscribe({
      next: (response: any) => {
        if (response.data) {
          // Filter for English translations only
          this.translations = response.data.filter(
            (t: any) => t.type === 'translation' && t.language === 'en'
          );
        }
        this.isLoadingTranslations = false;
      },
      error: (err) => {
        console.error('Error loading translations:', err);
        this.isLoadingTranslations = false;
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
}
