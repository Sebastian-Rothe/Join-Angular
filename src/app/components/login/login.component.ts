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

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email?.trim()) {
      this.snackbarService.error('Please enter your email address');
      return false;
    }

    if (!emailRegex.test(email.trim())) {
      this.snackbarService.error('Please enter a valid email address');
      return false;
    }

    return true;
  }

  private validatePassword(password: string): boolean {
    if (!password) {
      this.snackbarService.error('Please enter your password');
      return false;
    }
    return true;
  }

  private async performLogin(email: string, password: string): Promise<boolean> {
    const result = await this.authService.login(email.trim(), password);
    if (result?.user) {
      await this.router.navigate(['/main']);
      return true;
    }
    return false;
  }

  async loginUser() {
    try {
      if (!this.validateEmail(this.email)) return;
      if (!this.validatePassword(this.password)) return;
      await this.performLogin(this.email, this.password);
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
