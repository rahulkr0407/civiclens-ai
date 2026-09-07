import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../../../core/services/search';
import { Topic } from '../../../../core/models/topic';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { Chip } from '../../../../shared/components/chip/chip';
import { SectionTitle } from '../../../../shared/components/section-title/section-title';

interface SourceGroup {
  topic: Topic;
  sources: Topic['sources'];
}

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [LoadingSpinner, Chip, SectionTitle],
  templateUrl: './sources.html',
})
export class SourcesComponent implements OnInit {

  groups: SourceGroup[] = [];

  loading = true;
  errorMessage = '';

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.getTopics().subscribe({
      next: (topics) => {
        this.groups = topics
          .filter((topic) => topic.sources && topic.sources.length > 0)
          .map((topic) => ({
            topic,
            sources: topic.sources,
          }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'Unable to load sources right now. Please try again later.';
        this.loading = false;
      },
    });
  }
}