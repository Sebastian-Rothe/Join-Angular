import { AsyncPipe } from '@angular/common';
import { Component} from '@angular/core';
import { Observable } from 'rxjs';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
// Services
import { AuthService } from '../../../services/auth.service';


/**
 * Component for displaying legal information and notices.
 */
@Component({
  selector: 'app-legal-notice',
  imports: [MatIconModule, AsyncPipe],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss',
})
export class LegalNoticeComponent {
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
