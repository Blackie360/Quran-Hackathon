import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ChaptersListComponent } from './components/chapters-list/chapters-list.component';
import { VerseDisplayComponent } from './components/verse-display/verse-display.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'home',
    component: LandingComponent
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
