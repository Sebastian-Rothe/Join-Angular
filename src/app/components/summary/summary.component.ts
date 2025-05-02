import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  metrics = {
    todo: 0,
    done: 0,
    urgent: 0,
    upcomingDeadline: null as Date | null,
    tasksInBoard: 0,
    tasksInProgress: 0,
    awaitingFeedback: 0
  };

  greeting = '';
  userName = '';

  constructor(
    private taskService: TaskService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await this.loadMetrics();
    this.loadUserData();
    this.setGreeting();
  }

  private async loadMetrics() {
    try {
      this.metrics = await this.taskService.getTaskMetrics();
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  private loadUserData() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      }
    });
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }
}
