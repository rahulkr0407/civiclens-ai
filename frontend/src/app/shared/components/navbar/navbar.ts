import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit, OnDestroy {

  mobileMenuOpen = false;

  isLoggedIn = false;
  user: AuthUser | null = null;

  private authSubscription: Subscription | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.authSubscription = this.auth.authState$.subscribe(() => {
      this.loadUser();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadUser(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.user = this.auth.getUser();
  }

  logout(): void {
    this.auth.logout();

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