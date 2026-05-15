import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuranService } from '../../services/quran.service';

interface SearchResult {
  verseKey: string;
  chapterId: number;
  verseNumber: number;
  text: string;
  translation: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.css'
})
export class GlobalSearchComponent {
  query = '';
  results: SearchResult[] = [];
  hasSearched = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private quranService: QuranService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  search(): void {
    const value = this.query.trim();

    if (!value) {
      this.results = [];
      this.hasSearched = false;
      this.error = null;
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.hasSearched = true;

    this.quranService.searchVerses(value, 25).subscribe({
      next: (response: any) => {
        this.results = (response.search?.results || []).map((result: any) => {
          const [chapterId, verseNumber] = String(result.verse_key).split(':').map(Number);
          return {
            verseKey: result.verse_key,
            chapterId,
            verseNumber,
            text: this.cleanText(result.text || ''),
            translation: this.cleanText(result.translations?.[0]?.text || '')
          };
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.error = 'Search failed. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openResult(result: SearchResult): void {
    this.router.navigate(['/verses', result.chapterId, result.verseNumber]);
  }

  goBack(): void {
    this.router.navigate(['/chapters']);
  }

  private cleanText(value: string): string {
    return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
}
