import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [],
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
})
export class SearchBoxComponent {

  constructor(private router: Router) {}

  search() {
    this.router.navigate(['/search']);
  }

}