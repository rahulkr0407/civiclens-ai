import { Component } from '@angular/core';
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

  constructor(private searchService: SearchService) {
    this.topics = this.searchService.getTopics();
  }

}