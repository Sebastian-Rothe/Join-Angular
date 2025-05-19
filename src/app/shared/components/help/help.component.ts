import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

/**
 * Help component that displays application usage instructions and documentation.
 */
@Component({
  selector: 'app-help',
  imports: [MatIconModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent implements OnInit {
  /**
   * Creates an instance of HelpComponent.
   */
  constructor(
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    const element = document.querySelector('.all');
    if (element && !this.router.url.startsWith('/main')) {
      element.classList.add('with-scrollbar');
    }
  }

  /**
   * Navigates back to the previous page in the browser's history.
   */
  goBack() {
    this.location.back();
  }
}
