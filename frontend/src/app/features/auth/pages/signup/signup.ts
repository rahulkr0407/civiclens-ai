import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleSignInService } from '../../../../core/services/google-sign-in';
import { ToastService } from '../../../../core/services/toast.service';
import { SignupRequest, LoginResponse } from '../../../../core/models/user.model';

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

  googleAvailable = false;
  googleLoading = false;

  constructor(
    private auth: AuthService,
    private google: GoogleSignInService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngAfterViewInit(): void {
    this.google.getClientId().subscribe((clientId) => {
      if (!clientId) {
        return;
      }
      this.googleAvailable = true;
      this.google.renderButton('google-signup-button', clientId, (credential) => {
        this.onGoogleCredential(credential);
      });
    });
  }

  signup(): void {

    // -------------------------
    // Validate account details
    // -------------------------

    if (!this.fullName.trim()) {
      this.toast.warning('Please enter your full name.');
      return;
    }

    if (!this.email.trim()) {
      this.toast.warning('Please enter your email address.');
      return;
    }

    if (this.password.length < 6) {
      this.toast.warning('Password must be at least 6 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.warning('Passwords do not match.');
      return;
    }

    // -------------------------
    // Validate learning profile
    // -------------------------

    if (this.age === null || this.age < 10 || this.age > 100) {
      this.toast.warning('Please enter a valid age.');
      return;
    }

    if (!this.educationLevel) {
      this.toast.warning('Please select your education level.');
      return;
    }

    if (this.interests.length === 0) {
      this.toast.warning('Please select at least one interest.');
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

    // -------------------------
    // Send request to FastAPI
    // -------------------------

    this.auth.signup(signupData)
      .subscribe({

        next: (response) => {

          console.log('Signup successful:', response);

          this.toast.success(
            'Account created successfully! Redirecting to login...'
          );

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        },

        error: (error) => {

          console.error('Signup failed:', error);

          this.toast.error(
            error.error?.detail ||
            'Unable to create account. Please try again.'
          );
        },
      });
  }
 onGoogleCredential(credential: string): void {
    this.googleLoading = true;

    this.auth.googleLogin(credential)
      .subscribe({
        next: (response: LoginResponse) => {
          this.googleLoading = false;

          this.auth.persistSession(
            response.user,
            response.access_token,
            response.refresh_token
          );

          this.toast.success(`Welcome, ${response.user.fullName}!`);

          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.googleLoading = false;
          this.toast.error(
            error.error?.detail ||
            'Unable to sign up with Google. Please try again.'
          );
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