import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../../../core/services/search';
import { Topic } from '../../../../core/models/topic';
import { TopicCard } from '../../../../shared/components/topic-card/topic-card';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { SectionTitle } from '../../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [TopicCard, LoadingSpinner, SectionTitle],
  templateUrl: './topics.html',
  styleUrl: './topics.scss',
})
export class TopicsComponent implements OnInit {

  topics: Topic[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private searchService: SearchService
  ) {}

  ngOnInit(): void {

    this.searchService.getTopics().subscribe({

      next: (topics) => {
        this.topics = topics;
        this.loading = false;

        console.log('Topics loaded:', this.topics);
      },

      error: (error) => {
        console.error('Failed to load topics:', error);

        this.errorMessage =
          'Unable to load topics right now. Please try again later.';

        this.loading = false;
      },

    });
  }
}