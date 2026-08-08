import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/pages/home/home';
import { SearchResultsComponent } from './features/search/pages/search-results/search-results';
import { TopicDetailsComponent } from './features/topics/pages/topic-details/topic-details';

import { LoginComponent } from './features/auth/pages/login/login';
import { SignupComponent } from './features/auth/pages/signup/signup';

export const routes: Routes = [

  // Root URL → Login page
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Home page
  {
    path: 'home',
    component: HomeComponent,
  },

  // Search
  {
    path: 'search',
    component: SearchResultsComponent,
  },

  // Topic details
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

  // Unknown URL → Login
  {
    path: '**',
    redirectTo: 'login',
  },
];