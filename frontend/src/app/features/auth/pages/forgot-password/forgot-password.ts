import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  email = '';
  submitted = false;
  devResetLink = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private toast: ToastService
  ) {}

  submit(): void {
    if (!this.email.trim()) {
      this.toast.warning('Please enter your email address.');
      return;
    }

    this.isLoading = true;

    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.submitted = true;
        this.devResetLink = response.dev_reset_link ?? '';
      },
      error: (error) => {
        this.isLoading = false;
        this.toast.error(
          error.error?.detail ||
          'Something went wrong. Please try again.'
        );
      },
    });
  }
}
