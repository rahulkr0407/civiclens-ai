import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { SearchBoxComponent } from '../../components/search-box/search-box';
import { TrendingTopics } from '../../components/trending-topics/trending-topics';
import { Features } from '../../components/features/features';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, SearchBoxComponent,TrendingTopics,Features],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}