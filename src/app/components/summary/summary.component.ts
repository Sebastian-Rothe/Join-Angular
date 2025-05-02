import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  metrics = {
    todo: 0,
    done: 0,
    urgent: 0,
    upcomingDeadline: new Date(),
    tasksInBoard: 0,
    tasksInProgress: 0,
    awaitingFeedback: 0
  };

  greeting = '';
  userName = '';

  ngOnInit() {
    this.loadMetrics();
    this.setGreeting();
  }

  private loadMetrics() {
    // TODO: Implement loading metrics from service
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
    
    // TODO: Get actual user name
    this.userName = 'Guest';
  }
}
