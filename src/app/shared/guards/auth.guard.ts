import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';

/**
 * Authentication Guard for protecting routes in the application.
 * This guard ensures that only authenticated users can access protected routes.
 *
 * @description
 * The AuthGuard implements route protection by checking if a user is currently logged in.
 * If no user is authenticated, it redirects to the login page and prevents access to the protected route.
 *
 * @example
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'protected',
 *     component: ProtectedComponent,
 *     canActivate: [AuthGuard]
 *   }
 * ];
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  // Public routes that don't require authentication
  private publicRoutes = ['/main/legal', '/main/privacy'];

  /**
   * Creates an instance of AuthGuard.
   *
   * @param router - Angular Router service for navigation
   * @param userService - Service managing user authentication state
   * @param snackbarService - Service for displaying notification messages
   */
  constructor(
    private router: Router,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Guard method that determines if a route can be activated.
   *
   * @returns Promise<boolean> Returns true if the user is authenticated, false otherwise
   * @throws Will catch any errors during authentication check and return false
   *
   * @description
   * This method performs the following checks:
   * 1. Attempts to get the current user from the UserService
   * 2. If no user is found, redirects to login page
   * 3. If an error occurs, shows an error message and redirects to login
   */
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Allow access to public routes without authentication
      if (this.publicRoutes.includes(state.url)) {
        return true;
      }

      const user = await firstValueFrom(this.userService.currentUser$);

      if (!user) {
        this.router.navigate(['/login']);
        return false;
      }

      return true;
    } catch (error) {
      this.snackbarService.error('Authentication failed. Please login again.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
