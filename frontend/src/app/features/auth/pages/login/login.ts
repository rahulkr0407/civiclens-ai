import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  login(): void {
    console.log('Login:', {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}