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

  // Account details
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Learning profile
  age: number | null = null;
  educationLevel = '';
  interests: string[] = [];

  // UI state
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

    // -------------------------
    // Validate account details
    // -------------------------

    if (!this.fullName.trim()) {
      this.errorMessage = 'Please enter your full name.';
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // -------------------------
    // Validate learning profile
    // -------------------------

    if (this.age === null || this.age < 10 || this.age > 100) {
      this.errorMessage = 'Please enter a valid age.';
      return;
    }

    if (!this.educationLevel) {
      this.errorMessage = 'Please select your education level.';
      return;
    }

    if (this.interests.length === 0) {
      this.errorMessage = 'Please select at least one interest.';
      return;
    }

    // -------------------------
    // Prepare request
    // -------------------------

    const signupData = {
      fullName: this.fullName.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,

      age: this.age,
      educationLevel: this.educationLevel,
      interests: this.interests,
    };

    console.log('Signup request:', {
      fullName: signupData.fullName,
      email: signupData.email,
      age: signupData.age,
      educationLevel: signupData.educationLevel,
      interests: signupData.interests,
    });

    // -------------------------
    // Send request to FastAPI
    // -------------------------

    this.http
      .post(`${this.apiUrl}/signup`, signupData)
      .subscribe({

        next: (response) => {

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
        },
      });
  }
 toggleInterest(interest: string, event: Event): void {
  const checkbox = event.target as HTMLInputElement;

  if (checkbox.checked) {
    if (!this.interests.includes(interest)) {
      this.interests.push(interest);
    }
  } else {
    this.interests = this.interests.filter(
      item => item !== interest
    );
  }
}
}