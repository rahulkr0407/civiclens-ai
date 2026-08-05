import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../../core/services/search';
import { Topic } from '../../../../core/models/topic';

@Component({
  selector: 'app-trending-topics',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './trending-topics.html',
  styleUrl: './trending-topics.scss',
})
export class TrendingTopics implements OnInit {

  topics: Topic[] = [];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.getTopics().subscribe({
      next: (topics) => {
        this.topics = topics;
      },
      error: (error) => {
        console.error('Failed to load trending topics:', error);
      },
    });
  }
}