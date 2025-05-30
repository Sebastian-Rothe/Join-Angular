import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
// Services
import { AuthService } from '../../../services/auth.service';

/**
 * Component for displaying the application's privacy policy.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [MatIconModule, AsyncPipe],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  user$: Observable<any>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }

  /**
   * Navigates back to the previous page using browser history.
   */
  navigateBack() {
    window.history.back();
  }
}
