import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Material imports
import { MatIconModule } from '@angular/material/icon';
// Services
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';  
// Models
import { User } from '../../models/user.class';

/**
 * Component that handles the user registration process.
 * Provides form validation, Firebase authentication, and user creation functionality.
 * Includes features for password visibility toggling and sequential form validation.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  /** User's chosen username */
  username: string = '';
  
  /** User's email address */
  email: string = '';
  
  /** User's chosen password */
  password: string = '';
  
  /** Password confirmation field */
  confirmPassword: string = '';
  
  /** Indicates whether privacy policy has been accepted */
  policyAccepted: boolean = false;
  
  /** Error message to display to the user */
  errorMessage: string = '';
  
  /** Indicates whether the form has been submitted */
  formSubmitted = false;
  
  /** Object containing validation error messages for each form field */
  validationErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  
  /** Controls password field visibility */
  hidePassword = true;
  
  /** Controls confirm password field visibility */
  hideConfirmPassword = true;
  
  /** Tracks if password field is focused */
  isPasswordFocused = false;
  
  /** Tracks if confirm password field is focused */
  isConfirmPasswordFocused = false;
  
  /** User instance initialized at component start */
  user = new User();
  
  /** Tracks the currently active form field */
  currentField: 'username' | 'email' | 'password' | 'confirmPassword' | 'policy' | null = null;

  /**
   * Creates an instance of SignupComponent.
   * @param {AuthService} authService - Service for Firebase authentication
   * @param {Router} router - Angular router for navigation
   * @param {SnackbarService} snackbarService - Service for displaying notifications
   */
  constructor(
    private authService: AuthService, 
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Validates the username input against required format.
   * Checks for minimum length and valid characters.
   * @returns {boolean} True if username is valid, false otherwise
   * @private
   */
  private validateUsername(): boolean {
    const nameRegex = /^[a-zA-ZäöüÄÖÜß]+(([',. -][a-zA-ZäöüÄÖÜß ])?[a-zA-ZäöüÄÖÜß]*)*$/;
    
    if (!this.username.trim()) {
      this.validationErrors.username = 'Name is required';
      return false;
    }
    if (this.username.trim().length < 2) {
      this.validationErrors.username = 'Name must be at least 2 characters';
      return false;
    }
    if (!nameRegex.test(this.username)) {
      this.validationErrors.username = 'Please enter a valid name';
      return false;
    }
    this.validationErrors.username = '';
    return true;
  }

  /**
   * Validates the email input against required format.
   * Checks for proper email format using regex.
   * @returns {boolean} True if email is valid, false otherwise
   * @private
   */
  private validateEmail(): boolean {
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
  }

  /**
   * Validates the password against minimum requirements.
   * @returns {boolean} True if password is valid, false otherwise
   * @private
   */
  private validatePassword(): boolean {
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
  }

  /**
   * Validates that the confirm password matches the original password.
   * @returns {boolean} True if passwords match, false otherwise
   * @private
   */
  private validateConfirmPassword(): boolean {
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
  }

  /**
   * Validates a specific form field based on field name.
   * @param {string} field - The name of the field to validate
   * @returns {boolean} True if field is valid, false otherwise
   */
  validateField(field: string): boolean {
    if (!this.shouldValidateField(field)) return true;

    switch (field) {
      case 'username': return this.validateUsername();
      case 'email': return this.validateEmail();
      case 'password': return this.validatePassword();
      case 'confirmPassword': return this.validateConfirmPassword();
      default: return true;
    }
  }

  /**
   * Validates the entire form in a sequential manner.
   * Validates fields in order: username, email, password, confirmPassword, policy.
   * @returns {boolean} True if all validations pass, false otherwise
   */
  validateForm(): boolean {
    this.formSubmitted = true;
    this.errorMessage = '';
    
    // Sequenzielle Validierung
    if (!this.validateField('username')) {
      this.currentField = 'username';
      return false;
    }
    
    if (!this.validateField('email')) {
      this.currentField = 'email';
      return false;
    }
    
    if (!this.validateField('password')) {
      this.currentField = 'password';
      return false;
    }
    
    if (!this.validateField('confirmPassword')) {
      this.currentField = 'confirmPassword';
      return false;
    }
    
    if (!this.policyAccepted) {
      this.currentField = 'policy';
      this.errorMessage = 'Please accept the privacy policy';
      return false;
    }

    this.currentField = null;
    return true;
  }

  /**
   * Determines if a field should be validated based on the validation sequence.
   * Each field is validated only if the previous fields are valid.
   * @param {string} field - The field to check for validation
   * @returns {boolean} True if the field should be validated, false otherwise
   * @private
   */
  private shouldValidateField(field: string): boolean {
    switch (field) {
      case 'username':
        return true;
      case 'email':
        return this.validateField('username');
      case 'password':
        return this.validateField('email');
      case 'confirmPassword':
        return this.validateField('password');
      default:
        return false;
    }
  }

  /**
   * Creates a new user account in Firebase Authentication.
   * @returns {Promise<any>} Firebase user object
   * @private
   */
  private async createFirebaseUser(): Promise<any> {
    return await this.authService.register(this.email, this.password);
  }

  /**
   * Creates a user document in the database after successful authentication.
   * @param {any} firebaseUser - The Firebase user object
   * @returns {Promise<void>}
   * @private
   */
  private async createUserInDatabase(firebaseUser: any): Promise<void> {
    const newUser = new User({
      uid: firebaseUser.uid,
      name: this.username,
      email: this.email
    });
    await this.authService.createUserDocument(firebaseUser.uid, newUser);
  }

  /**
   * Handles successful signup by showing success message and redirecting.
   * @private
   */
  private handleSignupSuccess(): void {
    this.snackbarService.success('Sign up successful! Redirecting to login...');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  /**
   * Main signup method that orchestrates the registration process.
   * Validates form, creates Firebase user, and stores user data.
   * @async
   * @returns {Promise<void>}
   */
  async signUp() {
    if (!this.validateForm()) return;

    try {
      const firebaseUser = await this.createFirebaseUser();
      if (firebaseUser) {
        await this.createUserInDatabase(firebaseUser);
        this.handleSignupSuccess();
      }
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  /**
   * Navigates back to the login page.
   */
  backToLoginPage() {
    this.router.navigate(['/login']);
  }

  /**
   * Maps Firebase error codes to user-friendly error messages.
   * @param {string} errorCode - Firebase error code
   * @returns {string} User-friendly error message
   * @private
   */
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

  /**
   * Toggles the visibility of password fields.
   * @param {'password' | 'confirmPassword'} field - The password field to toggle
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  /**
   * Handles focus events for password fields.
   * @param {'password' | 'confirmPassword'} field - The password field receiving focus
   */
  onPasswordFocus(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.isPasswordFocused = true;
    } else {
      this.isConfirmPasswordFocused = true;
    }
  }

  /**
   * Handles blur events for password fields.
   * Hides password after a short delay.
   * @param {'password' | 'confirmPassword'} field - The password field losing focus
   */
  onPasswordBlur(field: 'password' | 'confirmPassword') {
    setTimeout(() => {
      if (field === 'password') {
        this.isPasswordFocused = false;
        this.hidePassword = true; // Passwort verstecken beim Verlassen des Fokus
      } else {
        this.isConfirmPasswordFocused = false;
        this.hideConfirmPassword = true; // Bestätigungspasswort verstecken beim Verlassen des Fokus
      }
    }, 200);
  }
}
