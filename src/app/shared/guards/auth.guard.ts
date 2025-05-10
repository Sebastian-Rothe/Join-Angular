import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private userService: UserService,
    private snackbar: SnackbarService
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.userService.currentUser$);
      if (!user) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;    } catch (error) {
      this.snackbar.error('Authentication failed. Please login again.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
