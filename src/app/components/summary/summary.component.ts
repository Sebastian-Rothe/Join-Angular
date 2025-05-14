import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';

/**
 * Component that displays a summary dashboard of task metrics and user information.
 * Provides an overview of tasks status, deadlines, and personalized greeting.
 * Updates metrics in real-time using TaskService and UserService.
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  /** Object containing various task metrics for the dashboard */
  metrics = {
    /** Number of tasks in todo status */
    todo: 0,
    /** Number of completed tasks */
    done: 0,
    /** Number of urgent priority tasks */
    urgent: 0,
    /** Date of the next upcoming deadline */
    upcomingDeadline: null as Date | null,
    /** Total number of tasks in the board */
    tasksInBoard: 0,
    /** Number of tasks currently in progress */
    tasksInProgress: 0,
    /** Number of tasks awaiting feedback */
    awaitingFeedback: 0
  };

  /** Current greeting based on time of day */
  greeting = '';
  
  /** Name of the currently logged in user */
  userName = '';

  /**
   * Creates an instance of SummaryComponent.
   * @param {TaskService} taskService - Service for accessing task data
   * @param {UserService} userService - Service for user information
   * @param {SnackbarService} snackbarService - Service for displaying notifications
   */
  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Lifecycle hook that is called after component initialization.
   * Loads initial metrics, user data, and sets the appropriate greeting.
   * @async
   * @returns {Promise<void>}
   */
  async ngOnInit() {
    await this.loadMetrics();
    this.loadUserData();
    this.setGreeting();
  }

  /**
   * Loads task metrics from the TaskService.
   * Updates the metrics object with current task statistics.
   * Shows error notification if metrics loading fails.
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async loadMetrics() {
    try {
      this.metrics = await this.taskService.getTaskMetrics();
    } catch (error) {
      this.snackbarService.error('Failed to load metrics. Please try again later.');
    }
  }

  /**
   * Subscribes to user data updates from UserService.
   * Updates the userName when user data changes.
   * @private
   */
  private loadUserData() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      }
    });
  }

  /**
   * Sets the greeting message based on the current time of day.
   * Morning: 00:00-11:59
   * Afternoon: 12:00-16:59
   * Evening: 17:00-23:59
   * @private
   */
  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }
}
