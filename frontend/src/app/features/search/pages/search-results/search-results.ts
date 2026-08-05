import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../../core/services/search';
import { Topic } from '../../../../core/models/topic';

@Component({
  selector: 'app-search-results',
  standalone: true,
  templateUrl: './search-results.html',
})
export class SearchResultsComponent implements OnInit {

  searchText = '';
  allTopics: Topic[] = [];
  topics: Topic[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchText = this.route.snapshot.queryParamMap.get('q') ?? '';

    this.searchService.getTopics().subscribe({
      next: (topics) => {
        this.allTopics = topics;

        const search = this.searchText.toLowerCase().trim();

        this.topics = this.allTopics.filter((topic) =>
          topic.title.toLowerCase().includes(search) ||
          topic.category.toLowerCase().includes(search) ||
          topic.summary.toLowerCase().includes(search)
        );
      },
      error: (error) => {
        console.error('Failed to load topics:', error);
      },
    });
  }

  openTopic(id: string): void {
  this.router.navigate(['/topic', id], {
    queryParams: {
      q: this.searchText,
    },
  });
}
}