import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.class';
import { CompletedSubtasksPipe } from '../../pipes/completed-subtasks.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule, 
    CompletedSubtasksPipe, 
    MatMenuModule, 
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() clicked = new EventEmitter<void>();
  @Output() dragStarted = new EventEmitter<DragEvent>();
  @Output() statusChanged = new EventEmitter<void>();

  availableStatuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'awaitFeedback', label: 'Await Feedback' },
    { value: 'done', label: 'Done' }
  ];

  constructor(private taskService: TaskService) {}

  onDragStart(event: DragEvent) {
    this.dragStarted.emit(event);
  }

  onClick() {
    this.clicked.emit();
  }

  async moveToStatus(newStatus: string) {
    if (this.task.status !== newStatus) {
      await this.taskService.updateTaskStatus(this.task.id, newStatus);
      this.statusChanged.emit();
    }
  }

  getFilteredStatuses() {
    return this.availableStatuses.filter(status => status.value !== this.task.status);
  }
}
