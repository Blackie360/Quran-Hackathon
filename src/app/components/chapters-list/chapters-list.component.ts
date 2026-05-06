import { Component, OnInit } from '@angular/core';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChapters();
  }

  loadChapters(): void {
    console.log('Starting to load chapters...');
    this.quranService.getChapters('en').subscribe({
      next: (response: any) => {
        console.log('Chapters response received:', response);
        if (response && response.data && Array.isArray(response.data)) {
          this.chapters = response.data;
          console.log('Chapters loaded successfully:', this.chapters.length);
        } else {
          console.warn('Unexpected response structure:', response);
          this.error = 'Unexpected data format from server';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading chapters:', err);
        this.error = 'Failed to load chapters: ' + (err?.message || err?.status || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  selectChapter(chapterId: number): void {
    console.log('Navigating to chapter:', chapterId);
    this.router.navigate(['/verses', chapterId]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}


