import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
// Material imports
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
// Services
import { TaskService } from '../../services/task.service';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarService } from '../../services/snackbar.service';
// Models
import { Task } from '../../models/task.class';
// Pipes
import { CompletedSubtasksPipe } from '../../shared/pipes/completed-subtasks.pipe';

/**
 * Component that represents a draggable task card in the board view.
 * Provides functionality for displaying task information, handling drag events,
 * and updating task status through a context menu.
 */
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
  /** The task object to be displayed in the card */
  @Input() task!: Task;

  /** Event emitted when the card is clicked */
  @Output() clicked = new EventEmitter<void>();

  /** Event emitted when drag operation starts */
  @Output() dragStarted = new EventEmitter<DragEvent>();

  /** Available status options for the task */
  availableStatuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'awaitFeedback', label: 'Await Feedback' },
    { value: 'done', label: 'Done' }
  ];

  /**
   * Creates an instance of TaskCardComponent.
   * @param {TaskService} taskService - Service for managing tasks
   * @param {SnackbarService} snackbarService - Service for displaying notifications
   */
  constructor(
    private taskService: TaskService,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Handles the drag start event of the task card.
   * Emits the drag event to parent components.
   * @param {DragEvent} event - The drag event object
   */
  onDragStart(event: DragEvent) {
    this.dragStarted.emit(event);
  }

  /**
   * Handles click events on the task card.
   * Emits a click event to parent components.
   */
  onClick() {
    this.clicked.emit();
  }

  /**
   * Updates the task's status and persists the change.
   * Reverts the status if update fails.
   * @param {string} newStatus - The new status to be applied
   * @async
   * @returns {Promise<void>}
   */
  async moveToStatus(newStatus: string) {
    if (this.task.status !== newStatus) {
      const oldStatus = this.task.status;
      this.task.status = newStatus;
      
      try {
        await this.taskService.updateTaskStatus(this.task.id, newStatus);
      } catch (error) {
        this.task.status = oldStatus;
        this.snackbarService.error('Failed to update task status. Please try again.');
      }
    }
  }

  /**
   * Filters available statuses to exclude the current task status.
   * Used to populate the status change menu.
   * @returns {Array<{value: string, label: string}>} Array of available status options
   */
  getFilteredStatuses() {
    return this.availableStatuses.filter(status => status.value !== this.task.status);
  }
}
