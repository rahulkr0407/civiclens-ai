import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  successMessage = '';

  private apiUrl =
    'https://civiclens-ai-1-f708.onrender.com/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  signup(): void {

    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate name
    if (!this.fullName.trim()) {
      this.errorMessage = 'Please enter your full name.';
      return;
    }

    // Validate email
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    // Validate password
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    // Confirm password
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const signupData = {
      fullName: this.fullName.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
    };

    console.log('Signup request:', {
      fullName: signupData.fullName,
      email: signupData.email,
    });

    // Send signup request to FastAPI
    this.http.post(
      `${this.apiUrl}/signup`,
      signupData
    ).subscribe({

      next: (response: any) => {

        console.log('Signup successful:', response);

        this.successMessage =
          'Account created successfully! Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },

      error: (error) => {

        console.error('Signup failed:', error);

        this.errorMessage =
          error.error?.detail ||
          'Unable to create account. Please try again.';
      }
    });
  }
}