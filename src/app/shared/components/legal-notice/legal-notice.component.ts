import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

/**
 * Component for displaying legal information and notices.
 */
@Component({
  selector: 'app-legal-notice',
  imports: [MatIconModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent implements OnInit {
  /**
   * Creates an instance of LegalNoticeComponent.
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
