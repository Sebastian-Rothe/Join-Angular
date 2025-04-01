import { Component, OnInit } from '@angular/core';
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
  hidePassword = true;
  isPasswordFocused = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // ngOnInit() {
  //   this.authService.loginError$.subscribe(error => {
  //     this.loginError = error;
  //   });
  // }

  async loginUser() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      this.isLoading = false;
    }
   
  }

  loginGuest() {
    this.router.navigate(['/main']);
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
