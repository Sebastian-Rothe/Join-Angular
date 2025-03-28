import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  hidePassword = true;
  isPasswordFocused = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async loginUser() {
    if (!this.email || !this.password) return;
    
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/main']); // Änderung von '/dashboard' zu '/main'
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  loginGuest() {
    this.router.navigate(['/main']); // Änderung von '/dashboard' zu '/main'
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
      this.hidePassword = true; // Passwort verstecken beim Verlassen des Fokus
    }, 200);
  }
}
