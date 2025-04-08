import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.class';  

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  policyAccepted: boolean = false;
  errorMessage: string = '';
  formSubmitted = false;
  validationErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  hidePassword = true;
  hideConfirmPassword = true;
  isPasswordFocused = false;
  isConfirmPasswordFocused = false;
  user = new User(); // User wird beim Start initialisiert
  currentField: 'username' | 'email' | 'password' | 'confirmPassword' | 'policy' | null = null;
  constructor(private authService: AuthService, private router: Router) {}

  validateField(field: string): boolean {
    // Nur validieren wenn es das aktuelle Feld ist oder alle vorherigen valide sind
    if (!this.shouldValidateField(field)) return true;

    switch (field) {
      case 'username':
        const nameRegex =
          /^[a-zA-ZäöüÄÖÜß]+(([',. -][a-zA-ZäöüÄÖÜß ])?[a-zA-ZäöüÄÖÜß]*)*$/;
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
          this.validationErrors.password =
            'Password must be at least 6 characters';
          return false;
        }
        this.validationErrors.password = '';
        return true;

      case 'confirmPassword':
        if (!this.confirmPassword) {
          this.validationErrors.confirmPassword =
            'Please confirm your password';
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

  async signUp() {
    if (!this.validateForm()) return;

    try {
      // Erst Firebase Auth User erstellen
      const firebaseUser = await this.authService.register(this.email, this.password);
      
      if (firebaseUser) {
        // Dann User-Objekt mit allen Daten erstellen
        const newUser = new User({
          uid: firebaseUser.uid,
          name: this.username,
          email: this.email
        });

        // User-Daten in Firestore speichern
        await this.authService.createUserDocument(firebaseUser.uid, newUser);

        this.showSuccessPopup();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
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

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  onPasswordFocus(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.isPasswordFocused = true;
    } else {
      this.isConfirmPasswordFocused = true;
    }
  }

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
