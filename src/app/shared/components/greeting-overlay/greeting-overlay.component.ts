import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TaskService } from '../../../services/task.service';

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
    private userService: UserService,
    private taskService: TaskService
  ) {}

  async ngOnInit() {
    if (window.innerWidth >= 1200) {
      await this.taskService.getAllTasks();
      this.router.navigate(['/main/summary']);
      return;
    }

    this.setGreeting();
    this.loadUserData();
    const dataLoadingPromise = this.taskService.getAllTasks();
    
    setTimeout(() => {
      this.isClosing = true;
      setTimeout(async () => {
        await dataLoadingPromise;
        this.router.navigate(['/main/summary']);
      }, 1000);
    }, 1500);
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
}
