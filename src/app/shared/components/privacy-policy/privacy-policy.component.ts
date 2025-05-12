import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Component for displaying the application's privacy policy.
 * 
 * @description
 * This component presents the privacy policy information to users,
 * detailing how their data is collected, used, and protected.
 * Includes navigation functionality to return to the previous page.
 * 
 * @example
 * ```html
 * <app-privacy-policy></app-privacy-policy>
 * ```
 */
@Component({
  selector: 'app-privacy-policy',
  imports: [MatIconModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  /**
   * Creates an instance of PrivacyPolicyComponent.
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
