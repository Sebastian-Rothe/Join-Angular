import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Navigation bar component for the application's main navigation.
 * 
 * @description
 * This component provides the main navigation interface for the application,
 * allowing users to navigate between different sections of the app.
 * It is implemented as a standalone component using Angular's RouterLink
 * for navigation.
 * 
 * @example
 * ```html
 * <app-navbar></app-navbar>
 * ```
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

}
