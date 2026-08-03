import { Component } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { SearchService } from '../../../../core/services/search';

@Component({
  selector: 'app-topic-details',
  standalone: true,
  imports: [],
  templateUrl: './topic-details.html',
  styleUrl: './topic-details.scss',
})
export class TopicDetails {
  topic: any;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
  ) {
    const id = this.route.snapshot.paramMap.get('id');

    this.topic = this.searchService.getTopics().find(
      (topic) => topic.id === id
    );
  }

  goBackToResults() {
  window.history.back();
}

  explainWithAI() {
    console.log('Explain with AI clicked for:', this.topic.title);
  }
}