import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuranService } from '../../services/quran.service';

interface ChapterData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

@Component({
  selector: 'app-chapters-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chapters-list.component.html',
  styleUrl: './chapters-list.component.css'
})
export class ChaptersListComponent implements OnInit {
  chapters: ChapterData[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private quranService: QuranService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadChapters();
  }

  loadChapters(): void {
    const observable = this.quranService.getChapters('en');
    observable.subscribe({
      next: (response: any) => {
        if (response && response.chapters && Array.isArray(response.chapters)) {
          this.chapters = response.chapters.map((chapter: any) => ({
            number: chapter.id,
            name: chapter.name_arabic,
            englishName: chapter.name_simple,
            englishNameTranslation: chapter.translated_name?.name || chapter.name_simple,
            numberOfAyahs: chapter.verses_count,
            revelationType: chapter.revelation_place
          }));
        } else {
          console.warn('Unexpected response structure:', response);
          this.error = 'Unexpected data format from server';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading chapters:', err);
        console.error('Error details:', err.message, err.status, err.statusText);
        this.error = 'Failed to load chapters: ' + (err?.message || err?.status || 'Unknown error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectChapter(chapterId: number): void {
    this.router.navigate(['/verses', chapterId]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToSearch(): void {
    this.router.navigate(['/search']);
  }

  goToStudy(): void {
    this.router.navigate(['/study']);
  }
}
