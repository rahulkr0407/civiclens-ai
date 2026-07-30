import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/pages/home/home';
import { SearchResults } from './features/search/pages/search-results/search-results';
import { TopicDetails } from './features/topics/pages/topic-details/topic-details';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'search',
    component: SearchResults,
  },
  {
    path: 'topic/:id',
    component: TopicDetails,
  },
];