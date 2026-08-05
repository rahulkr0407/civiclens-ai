import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/pages/home/home';
import { SearchResultsComponent } from './features/search/pages/search-results/search-results';
import { TopicDetailsComponent } from './features/topics/pages/topic-details/topic-details';

import { LoginComponent } from './features/auth/pages/login/login';
import { SignupComponent } from './features/auth/pages/signup/signup';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },

  {
    path: 'search',
    component: SearchResultsComponent,
  },

  {
    path: 'topic/:id',
    component: TopicDetailsComponent,
  },

  // Authentication
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'signup',
    component: SignupComponent,
  },
];