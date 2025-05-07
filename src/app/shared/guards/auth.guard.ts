import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private router: Router, private userService: UserService) {}

  async canActivate(): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.userService.currentUser$);
      if (!user) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth guard error:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
