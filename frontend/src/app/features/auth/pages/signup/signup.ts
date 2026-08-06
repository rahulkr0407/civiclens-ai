import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private router: Router) {}

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

    // Temporary success
    this.successMessage = 'Account created successfully!';

    console.log('Signup:', {
      fullName: this.fullName,
      email: this.email,
    });

    // We'll connect this to FastAPI later
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}