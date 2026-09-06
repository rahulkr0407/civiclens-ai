import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginResponse } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  errorMessage = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    this.auth.login(this.email, this.password)
      .subscribe({
        next: (response: LoginResponse) => {

          console.log('Login successful:', response);

          this.auth.persistSession(response.user, response.access_token);

          this.isLoading = false;

          // Go to home page
          this.router.navigate(['/home']);
        },

        error: (error) => {

          console.error('Login failed:', error);

          this.isLoading = false;

          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password.';
          } else if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please make sure the backend is running.';
          } else {
            this.errorMessage =
              error.error?.detail ||
              'Something went wrong. Please try again.';
          }
        },
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}