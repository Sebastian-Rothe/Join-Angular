import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule]
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  isPasswordFocused = false;

  formErrors = {
    email: false,
    password: false
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  async loginUser() {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!this.email?.trim()) {
        this.snackbarService.error('Please enter your email address');
        return;
      }

      if (!emailRegex.test(this.email.trim())) {
        this.snackbarService.error('Please enter a valid email address');
        return;
      }

      if (!this.password) {
        this.snackbarService.error('Please enter your password');
        return;
      }

      const result = await this.authService.login(this.email.trim(), this.password);
      if (result?.user) {
        // this.snackbarService.success('Welcome back!');
        await this.router.navigate(['/main']);
      }
    } catch (error: any) {
      // AuthService handles specific error messages
    }
  }

  async loginGuest() {
    try {
      const guestUser = await this.authService.guestLogin();
      if (guestUser) {
        this.router.navigate(['/main']);
      }
    } catch (error) {
      this.snackbarService.error('Guest login failed. Please try again.');
    }
  }

  openSignUpPage() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onPasswordFocus() {
    this.isPasswordFocused = true;
  }

  onPasswordBlur() {
    setTimeout(() => {
      this.isPasswordFocused = false;
      this.hidePassword = true;
    }, 200);
  }
}
