import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  policyAccepted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  formSubmitted = false;
  validationErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateField(field: string): boolean {
    if (!this.formSubmitted) return true;

    switch (field) {
      case 'username':
        if (!this.username.trim()) {
          this.validationErrors.username = 'Name is required';
          return false;
        }
        this.validationErrors.username = '';
        return true;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email.trim()) {
          this.validationErrors.email = 'Email is required';
          return false;
        }
        if (!emailRegex.test(this.email)) {
          this.validationErrors.email = 'Please enter a valid email';
          return false;
        }
        this.validationErrors.email = '';
        return true;

      case 'password':
        if (!this.password) {
          this.validationErrors.password = 'Password is required';
          return false;
        }
        if (this.password.length < 6) {
          this.validationErrors.password = 'Password must be at least 6 characters';
          return false;
        }
        this.validationErrors.password = '';
        return true;

      case 'confirmPassword':
        if (!this.confirmPassword) {
          this.validationErrors.confirmPassword = 'Please confirm your password';
          return false;
        }
        if (this.password !== this.confirmPassword) {
          this.validationErrors.confirmPassword = 'Passwords do not match';
          return false;
        }
        this.validationErrors.confirmPassword = '';
        return true;

      default:
        return true;
    }
  }

  async signUp() {
    this.formSubmitted = true;
    this.errorMessage = '';
    
    const isValid = [
      this.validateField('username'),
      this.validateField('email'),
      this.validateField('password'),
      this.validateField('confirmPassword')
    ].every(valid => valid) && this.policyAccepted;

    if (!isValid) {
      if (!this.policyAccepted) {
        this.errorMessage = 'Please accept the privacy policy';
      }
      return;
    }

    this.isLoading = true;
    
    try {
      await this.authService.register(this.email, this.password, this.username);
      this.showSuccessPopup();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  backToLoginPage() {
    this.router.navigate(['/login']);
  }

  private showSuccessPopup() {
    const popup = document.getElementById('success-popup');
    if (popup) {
      popup.style.display = 'flex';
      setTimeout(() => {
        popup.style.display = 'none';
      }, 2000);
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}
