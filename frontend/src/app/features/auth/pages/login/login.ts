import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  message: string;
  user: {
    fullName: string;
    email: string;
  };
}

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

  private apiUrl = 'https://civiclens-ai-1-f708.onrender.com/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    const loginData = {
      email: this.email,
      password: this.password,
    };

    this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .subscribe({
        next: (response) => {

          console.log('Login successful:', response);

          // Save logged-in user
          localStorage.setItem(
            'civiclens_user',
            JSON.stringify(response.user)
          );

          // Save login state
          localStorage.setItem('civiclens_logged_in', 'true');

          this.isLoading = false;

          // Go to home page
          this.router.navigate(['/']);
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