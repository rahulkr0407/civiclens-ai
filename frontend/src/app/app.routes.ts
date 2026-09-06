import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/pages/home/home';
import { SearchResultsComponent } from './features/search/pages/search-results/search-results';
import { TopicDetailsComponent } from './features/topics/pages/topic-details/topic-details';
import { TopicsComponent } from './features/topics/pages/topics/topics';

import { LoginComponent } from './features/auth/pages/login/login';
import { SignupComponent } from './features/auth/pages/signup/signup';
import { SourcesComponent } from './features/sources/pages/sources/sources';
import { AboutComponent } from './features/about/pages/about/about';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';
import { TrackersComponent } from './features/trackers/pages/trackers/trackers';
import { TrackerDetailsComponent } from './features/trackers/pages/tracker-details/tracker-details';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // Root URL → Login page
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Home
  {
    path: 'home',
    component: HomeComponent,
  },

  // Topics
  {
    path: 'topics',
    component: TopicsComponent,
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

  // Sources
  {
    path: 'sources',
    component: SourcesComponent,
  },

  // Trackers (Bills & Protests)
  {
    path: 'trackers',
    component: TrackersComponent,
  },

  // Tracker details
  {
    path: 'tracker/:id',
    component: TrackerDetailsComponent,
  },

  // About
  {
    path: 'about',
    component: AboutComponent,
  },

  // Dashboard (saved history)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
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