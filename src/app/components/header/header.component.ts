import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../models/user.class';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MatIconModule, CommonModule, RouterModule, MatMenuModule],
  standalone: true
})
export class HeaderComponent implements OnInit {
  isDropdownOpen = false;
  user: User = new User();

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService
  ) {
    // Add click outside listener
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-avatar') && !target.closest('.dropdown-menu')) {
        this.isDropdownOpen = false;
      }
    });
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  openDropdownMenu() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async logoutUser() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  openAccountDialog(): void {
    this.dialogService.openDialog('account');
  }
}
