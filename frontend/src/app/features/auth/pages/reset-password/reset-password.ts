import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token') ?? '';
      if (!this.token) {
        this.toast.error(
          'This reset link is missing a token. Please request a new one.'
        );
      }
    });
  }

  submit(): void {
    this.successMessage = '';

    if (!this.token) {
      this.toast.error('This reset link is invalid. Please request a new one.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toast.warning('Password must be at least 6 characters.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toast.warning('Passwords do not match.');
      return;
    }

    this.isLoading = true;

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'Your password has been updated. Redirecting to sign in…';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.toast.error(
          error.error?.detail ||
          'Unable to reset your password. Please try again.'
        );
      },
    });
  }
}
