import { Routes } from '@angular/router';
import { Landing } from './landing/landing.component'; 
import { ChaptersListComponent } from './components/chapters-list/chapters-list.component';
import { VerseDisplayComponent } from './components/verse-display/verse-display.component';

export const routes: Routes = [
  {
    path: '',
    component: Landing // Use Landing here
  },
  {
    path: 'home',
    component: Landing // Use Landing here
  },
  {
    path: 'chapters',
    component: ChaptersListComponent
  },
  {
    path: 'verses/:chapterId',
    component: VerseDisplayComponent
  }
];