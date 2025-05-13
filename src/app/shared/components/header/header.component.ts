import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../../models/user.class';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { HeaderService } from '../../../services/header.service';

/**
 * Header component that displays the application's top navigation bar.
 * 
 * @description
 * This component provides the main navigation header with user profile management,
 * including a dropdown menu for user actions like logout and account settings.
 * It handles user authentication state and provides navigation controls.
 * 
 * @example
 * ```html
 * <app-header></app-header>
 * ```
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MatIconModule, CommonModule, RouterModule, MatMenuModule],
  standalone: true
})
export class HeaderComponent implements OnInit, AfterViewInit {
  /** Controls the visibility state of the user dropdown menu */
  isDropdownOpen = false;

  /** Current user object containing user details */
  user: User = new User();

  @ViewChild('header') headerElement!: ElementRef;

  /**
   * Creates an instance of HeaderComponent.
   * Sets up click outside listener for dropdown menu.
   * 
   * @param userService - Service for user-related operations
   * @param authService - Service for authentication operations
   * @param router - Angular router service for navigation
   * @param dialogService - Service for managing dialog windows
   * @param snackbarService - Service for showing notification messages
   * @param headerService - Service for managing header-related operations
   */
  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
    private headerService: HeaderService
  ) {
    // Add click outside listener
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-avatar') && !target.closest('.dropdown-menu')) {
        this.isDropdownOpen = false;
      }
    });
  }

  /**
   * Lifecycle hook that initializes the component.
   * Subscribes to user updates and maintains current user state.
   */
  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  /**
   * Lifecycle hook that is called after the view has been initialized.
   * Sets the header element in the HeaderService.
   */
  ngAfterViewInit() {
    if (this.headerElement) {
      this.headerService.setHeaderElement(this.headerElement.nativeElement);
    }
  }

  /**
   * Toggles the visibility of the dropdown menu.
   * Used when clicking the profile avatar.
   */
  openDropdownMenu() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Alternative method to toggle dropdown visibility.
   * @deprecated Use openDropdownMenu() instead
   */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Handles user logout process.
   * Attempts to logout and redirects to login page on success.
   * Shows error message if logout fails.
   */
  async logoutUser() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      this.snackbarService.error('Logout failed. Please try again.');
    }
  }

  /**
   * Opens the account settings dialog.
   * Allows users to modify their account information.
   */
  openAccountDialog(): void {
    this.dialogService.openDialog('account');
  }
}
