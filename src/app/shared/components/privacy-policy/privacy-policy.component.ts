import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

/**
 * Component for displaying the application's privacy policy.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {
  /**
   * Creates an instance of PrivacyPolicyComponent.
   */
  constructor(private router: Router) {}

  ngOnInit() {
    const element = document.querySelector('.all');
    if (element && !this.router.url.startsWith('/main')) {
      element.classList.add('with-scrollbar');
    }
  }

  /**
   * Navigates back to the previous page using browser history.
   */
  navigateBack() {
    window.history.back();
  }
}
