import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { SearchBoxComponent } from '../../components/search-box/search-box';
import { TrendingTopics } from '../../components/trending-topics/trending-topics';
import { Features } from '../../components/features/features';
import { LearningProfileComponent } from '../../components/learning-profile/learning-profile';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, SearchBoxComponent, TrendingTopics, Features, LearningProfileComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
