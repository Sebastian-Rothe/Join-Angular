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
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async signUp() {
    if (!this.validateForm()) return;
    
    try {
      await this.authService.register(this.email, this.password);
      this.showSuccessPopup();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }

  private validateForm(): boolean {
    if (!this.username || this.username.trim() === '') return false;
    if (!this.email || this.email.trim() === '') return false;
    if (!this.password || this.password.trim() === '') return false;
    if (!this.confirmPassword || this.confirmPassword.trim() === '') return false;
    if (!this.policyAccepted) return false;
    if (this.password !== this.confirmPassword) return false;
    
    return true;
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
}
