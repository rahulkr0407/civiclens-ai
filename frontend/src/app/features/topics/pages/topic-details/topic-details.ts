import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../../core/services/search';
import { Topic } from '../../../../core/models/topic';

@Component({
  selector: 'app-topic-details',
  standalone: true,
  templateUrl: './topic-details.html',
})
export class TopicDetailsComponent implements OnInit {

  topic: Topic | undefined;
  searchText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.searchText = this.route.snapshot.queryParamMap.get('q') ?? '';

    if (!id) {
      return;
    }

    this.searchService.getTopics().subscribe({
      next: (topics) => {
        this.topic = topics.find(
          (topic: Topic) => topic.id === id
        );
      },
      error: (error) => {
        console.error('Failed to load topic:', error);
      },
    });
  }

 goBackToResults() {
  window.history.back();
}

  explainWithAI(): void {
    console.log('AI explanation coming soon...');
  }
}