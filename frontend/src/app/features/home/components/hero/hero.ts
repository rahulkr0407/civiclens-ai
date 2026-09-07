import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../../core/services/search';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
})
export class HeroComponent implements OnInit {

  topicsCount = 0;

  constructor(private search: SearchService) {}

  ngOnInit(): void {
    this.search.getTopics().subscribe({
      next: (topics) => {
        this.topicsCount = topics.length;
      },
      error: () => {
        this.topicsCount = 6;
      },
    });
  }
}