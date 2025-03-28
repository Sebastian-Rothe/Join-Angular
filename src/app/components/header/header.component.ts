import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isDropdownOpen = false;

  openDropdownMenu() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logoutUser() {
    // Implement logout logic here
    console.log('User logged out');
  }
}
