import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface User {
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit {

  mobileMenuOpen = false;

  isLoggedIn = false;
  user: User | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const loggedIn = localStorage.getItem('civiclens_logged_in');
    const savedUser = localStorage.getItem('civiclens_user');

    this.isLoggedIn = loggedIn === 'true';

    if (savedUser) {
      this.user = JSON.parse(savedUser);
    } else {
      this.user = null;
    }
  }

  logout(): void {
    localStorage.removeItem('civiclens_user');
    localStorage.removeItem('civiclens_logged_in');

    this.isLoggedIn = false;
    this.user = null;

    this.closeMobileMenu();

    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}