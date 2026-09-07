import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleSignInService } from '../../../../core/services/google-sign-in';
import { ToastService } from '../../../../core/services/toast.service';
import { LoginResponse } from '../../../../core/models/user.model';

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

  isLoading = false;

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
      this.google.renderButton('google-login-button', clientId, (credential) => {
        this.onGoogleCredential(credential);
      });
    });
  }

  login(): void {

    if (!this.email || !this.password) {
      this.toast.warning('Please enter your email and password.');
      return;
    }

    this.isLoading = true;

    this.auth.login(this.email, this.password)
      .subscribe({
        next: (response: LoginResponse) => {

          this.auth.persistSession(
            response.user,
            response.access_token,
            response.refresh_token,
            this.rememberMe
          );

          this.isLoading = false;

          this.toast.success(`Welcome back, ${response.user.fullName}!`);

          // Go to home page
          this.router.navigate(['/home']);
        },

        error: (error) => {

          this.isLoading = false;

          if (error.status === 401) {
            this.toast.error('Invalid email or password.');
          } else if (error.status === 0) {
            this.toast.error(
              'Unable to connect to the server. Please make sure the backend is running.'
            );
          } else {
            this.toast.error(
              error.error?.detail ||
              'Something went wrong. Please try again.'
            );
          }
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
            response.refresh_token,
            this.rememberMe
          );

          this.toast.success(`Welcome back, ${response.user.fullName}!`);

          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.googleLoading = false;
          this.toast.error(
            error.error?.detail ||
            'Unable to sign in with Google. Please try again.'
          );
        },
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}