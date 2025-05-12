import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

/**
 * Main content component that serves as the primary layout container.
 * 
 * @description
 * This component acts as the main structural container for the application,
 * incorporating the header, navigation bar, and the main content area.
 * It uses Angular's standalone component architecture and serves as a
 * wrapper for all authenticated content.
 * 
 * @example
 * ```html
 * <app-main-content>
 *   <!-- Child routes will be rendered here -->
 * </app-main-content>
 * ```
 */
@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, RouterModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {
}
