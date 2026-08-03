import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  searchText = '';

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.allTopics = this.searchService.getTopics();

    this.route.queryParams.subscribe((params) => {
      console.log('Params:', params);

      this.searchText = params['q'] || '';
      const searchText = this.searchText.toLowerCase();

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
  openTopic(id: string) {
  this.router.navigate(['/topic', id]);
}
}
