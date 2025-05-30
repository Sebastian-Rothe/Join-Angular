import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
// Services
import { AuthService } from '../../../services/auth.service';

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
  imports: [RouterLink, AsyncPipe, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  user$: Observable<any>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  
  }
}
