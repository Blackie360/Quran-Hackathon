import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudyNote, StudyStorageService, StudyVerse } from '../../services/study-storage.service';

@Component({
  selector: 'app-study-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './study-library.component.html',
  styleUrl: './study-library.component.css'
})
export class StudyLibraryComponent implements OnInit {
  bookmarks: StudyVerse[] = [];
  notes: StudyNote[] = [];
  history: StudyVerse[] = [];
  activeTab: 'bookmarks' | 'notes' | 'history' = 'bookmarks';

  constructor(
    private studyStorage: StudyStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.bookmarks = this.studyStorage.getBookmarks();
    this.notes = this.studyStorage.getNotes();
    this.history = this.studyStorage.getHistory();
  }

  openVerse(item: StudyVerse): void {
    this.router.navigate(['/verses', item.chapterId, item.verseNumber]);
  }

  clearHistory(): void {
    this.studyStorage.clearHistory();
    this.refresh();
  }

  goBack(): void {
    this.router.navigate(['/chapters']);
  }
}
