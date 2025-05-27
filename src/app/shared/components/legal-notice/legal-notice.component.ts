import { Component} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';


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
