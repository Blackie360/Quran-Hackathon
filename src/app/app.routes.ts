import { Routes } from '@angular/router';
import { Landing } from './landing/landing.component'; 
import { ChaptersListComponent } from './components/chapters-list/chapters-list.component';
import { VerseDisplayComponent } from './components/verse-display/verse-display.component';
import { VerseDetails } from './components/verse-details/verse-details';
import { GlobalSearchComponent } from './components/global-search/global-search.component';
import { StudyLibraryComponent } from './components/study-library/study-library.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

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
    path: 'search',
    component: GlobalSearchComponent
  },
  {
    path: 'study',
    component: StudyLibraryComponent
  },
  {
    path: 'verses/:chapterId/:verseNumber',
    component: VerseDetails
  },
  {
    path: 'verses/:chapterId',
    component: VerseDisplayComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
