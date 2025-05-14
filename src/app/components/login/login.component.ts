import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../services/snackbar.service';

/**
 * Component that handles the login functionality of the application.
 * Provides user authentication through email/password and guest login options.
 */
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

  /**
   * Validates the email input against required format.
   * @param {string} email - The email address to validate
   * @returns {boolean} True if email is valid, false otherwise
   * @private
   */
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

  /**
   * Validates if password is provided.
   * @param {string} password - The password to validate
   * @returns {boolean} True if password is not empty, false otherwise
   * @private
   */
  private validatePassword(password: string): boolean {
    if (!password) {
      this.snackbarService.error('Please enter your password');
      return false;
    }
    return true;
  }

  /**
   * Performs the actual login operation using the auth service.
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @returns {Promise<boolean>} Promise resolving to true if login successful
   * @private
   */
  private async performLogin(email: string, password: string): Promise<boolean> {
    const result = await this.authService.login(email.trim(), password);
    if (result?.user) {
      await this.router.navigate(['/main']);
      return true;
    }
    return false;
  }

  /**
   * Main login method that orchestrates email validation, password validation,
   * and login attempt.
   * @async
   * @returns {Promise<void>}
   */
  async loginUser() {
    try {
      if (!this.validateEmail(this.email)) return;
      if (!this.validatePassword(this.password)) return;
      await this.performLogin(this.email, this.password);
    } catch (error: any) {
      // AuthService handles specific error messages
    }
  }

  /**
   * Handles guest user login functionality.
   * Redirects to main page upon successful login.
   * @async
   * @returns {Promise<void>}
   */
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

  /**
   * Navigates to the sign-up page.
   */
  openSignUpPage() {
    this.router.navigate(['/signup']);
  }

  /**
   * Toggles password visibility in the password input field.
   */
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Handles the focus event of the password input field.
   * Sets the password field focus state.
   */
  onPasswordFocus() {
    this.isPasswordFocused = true;
  }

  /**
   * Handles the blur event of the password input field.
   * Resets password visibility and focus state after a short delay.
   */
  onPasswordBlur() {
    setTimeout(() => {
      this.isPasswordFocused = false;
      this.hidePassword = true;
    }, 200);
  }
}
