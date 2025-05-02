import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-greeting-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="greeting-overlay" [class.fade-out]="isClosing">
      <div class="greeting-content">
        <h2>{{ greeting }}</h2>
        <h1>{{ userName }}</h1>
      </div>
    </div>
  `,
  styleUrls: ['./greeting-overlay.component.scss']
})
export class GreetingOverlayComponent implements OnInit {
  greeting = '';
  userName = '';
  isClosing = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.setGreeting();
    this.loadUserData();
    setTimeout(() => {
      this.isClosing = true;
      setTimeout(() => {
        this.closeOverlay();
      }, 1000);
    }, 2000);
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  private loadUserData() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      }
    });
  }

  private closeOverlay() {
    this.router.navigate(['/main/summary']);
  }
}
