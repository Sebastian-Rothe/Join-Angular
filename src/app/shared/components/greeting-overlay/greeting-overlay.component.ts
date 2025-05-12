import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TaskService } from '../../../services/task.service';

/**
 * A component that displays a temporary greeting overlay with time-based messages.
 * 
 * @description
 * This component shows a welcoming overlay with a time-appropriate greeting
 * (good morning/afternoon/evening) and the user's name. It automatically
 * fades out after a short delay and redirects to the summary page.
 * 
 * For desktop views (≥1200px), it skips the animation and redirects immediately.
 * 
 * @example
 * ```html
 * <app-greeting-overlay></app-greeting-overlay>
 * ```
 */
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
  /** The time-based greeting message (e.g., "Good morning") */
  greeting = '';
  
  /** The name of the currently logged-in user */
  userName = '';
  
  /** Flag to control the fade-out animation state */
  isClosing = false;

  /**
   * Creates an instance of GreetingOverlayComponent.
   * 
   * @param router - Angular router service for navigation
   * @param userService - Service for user-related operations
   * @param taskService - Service for task-related operations
   */
  constructor(
    private router: Router,
    private userService: UserService,
    private taskService: TaskService
  ) {}

  /**
   * Lifecycle hook that runs on component initialization.
   * Handles the component's initialization logic including:
   * - Loading tasks
   * - Setting appropriate greetings
   * - Managing desktop vs mobile behavior
   * - Controlling animation timing
   * 
   * @returns Promise<void>
   */
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

  /**
   * Sets the appropriate greeting based on the current time of day.
   * - Before 12:00: "Good morning"
   * - 12:00 to 17:00: "Good afternoon"
   * - After 17:00: "Good evening"
   * 
   * @private
   */
  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  /**
   * Loads and sets the current user's name from the UserService.
   * Updates the userName property when user data is available.
   * 
   * @private
   */
  private loadUserData() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      }
    });
  }
}
