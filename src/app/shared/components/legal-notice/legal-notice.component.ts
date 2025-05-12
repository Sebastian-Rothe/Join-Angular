import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Component for displaying legal information and notices.
 * 
 * @description
 * This component presents legal information such as terms of service,
 * privacy policy, and other legal disclaimers. It includes navigation
 * functionality to return to the previous page.
 * 
 * @example
 * ```html
 * <app-legal-notice></app-legal-notice>
 * ```
 */
@Component({
  selector: 'app-legal-notice',
  imports: [MatIconModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
  /**
   * Creates an instance of LegalNoticeComponent.
   * 
   */
  constructor() {}

  /**
   * Navigates back to the previous page using browser history.
   * Uses the browser's native history API.
   */
  navigateBack() {
    window.history.back();
  }
}
