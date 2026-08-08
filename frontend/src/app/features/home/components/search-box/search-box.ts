import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
})
export class SearchBoxComponent {

  searchText = '';

  constructor(private router: Router) {}

  search(): void {

    const query = this.searchText.trim();

    // Don't search if the box is empty
    if (!query) {
      return;
    }

    this.router.navigate(['/search'], {
      queryParams: {
        q: query,
      },
    });
  }
}