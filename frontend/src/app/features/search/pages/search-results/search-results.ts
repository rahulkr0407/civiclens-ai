import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../../core/services/search';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
})
export class SearchResults {
  topics: any[] = [];
  allTopics: any[] = [];

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
  ) {
    this.allTopics = this.searchService.getTopics();

    this.route.queryParams.subscribe((params) => {
      console.log('Params:', params);

      const searchText = (params['q'] || '').toLowerCase();

      console.log('Search Text:', searchText);

      if (!searchText) {
        this.topics = this.allTopics;
        return;
      }

      console.log('All Topics:', this.allTopics);

      this.topics = this.allTopics.filter((topic) =>
        topic.title.toLowerCase().includes(searchText),
      );

      console.log('Filtered Topics:', this.topics);
    });
  }
}
