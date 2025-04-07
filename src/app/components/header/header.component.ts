import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../models/user.class';
import { UserService } from '../../services/user.service';

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

  constructor(public userService: UserService) {
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
        console.log('Current user:', this.user);
      }
    });
  }

  openDropdownMenu() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logoutUser() {
    console.log('User logged out');
  }
}
