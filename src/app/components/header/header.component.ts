import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MatIconModule],
  standalone: true
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
