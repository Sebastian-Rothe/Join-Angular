import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.class';

import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { SnackbarService } from '../../services/snackbar.service';

/**
 * Interface for dialog results returned by task dialogs
 */
type TaskDialogResult = 'taskAdded' | 'deleted' | 'updated';

/**
 * Dialog configuration interface for task dialogs
 */
interface TaskDialogConfig {
  width: string;
  maxWidth: string;
  height: string;
  data: any;
  panelClass: string | string[];
}

/**
 * Component for managing and displaying tasks in a Kanban-style board.
 * 
 * This component provides a comprehensive interface for:
 * - Displaying tasks in different status columns
 * - Enabling drag and drop functionality between columns
 * - Searching and filtering tasks
 * - Creating new tasks and viewing task details
 * - Real-time updates of task changes
 * 
 * Features:
 * - Task status management (Todo, In Progress, Await Feedback, Done)
 * - Visual drag and drop interface
 * - Task search functionality
 * - Dialog-based task creation and editing
 * - Real-time task list updates
 * 
 * @example
 * ```typescript
 * // Opening board with default configuration
 * <app-board></app-board>
 * 
 * // Using board with task filtering
 * <app-board [initialFilter]="'urgent'"></app-board>
 * ```
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    RouterModule, 
    TaskCardComponent
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  /** Search query for filtering tasks */
  searchQuery: string = '';
  
  /** All tasks loaded from the database */
  tasks: Task[] = [];
  
  /** Tasks filtered by search query */
  filteredTasks: Task[] = [];
  
  /** Flag for dropdown menu state */
  isDropdownOpen = false;
  
  /** Currently dragged task */
  draggedTask: Task | null = null;

  /** List of board section IDs for drag and drop */
  private readonly boardSections = ['todoBoard', 'inProgressBoard', 'awaitFeedbackBoard', 'doneBoard'];

  /**
   * Creates an instance of BoardComponent.
   * 
   * @param taskService - Service for managing tasks and their states
   * @param dialog - Material Dialog service for task dialogs
   * @param snackbarService - Service for showing user notifications
   */
  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.initializeTaskSubscription();
  }

  /**
   * Initializes the subscription to task updates
   */
  private initializeTaskSubscription(): void {
    this.loadTasks();
    this.taskService.tasks$.subscribe(tasks => {
      if (tasks.length > 0) {
        this.updateTasks(tasks);
      }
    });
  }

  /**
   * Updates both the main tasks array and filtered tasks array with new data.
   * Creates a new array reference for filtered tasks to trigger change detection.
   * 
   * @param tasks - Array of tasks to update with
   */
  private updateTasks(tasks: Task[]): void {
    this.tasks = tasks;
    this.filteredTasks = [...tasks];
  }

  /**
   * Loads all tasks from the task service and updates local task arrays.
   * Shows error notification if task loading fails.
   * 
   * @throws {Error} When task loading fails
   * @fires SnackbarService#error
   */
  async loadTasks(): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();
      this.updateTasks(tasks);
    } catch (error) {
      this.snackbarService.error('Failed to load tasks');
    }
  }

  /**
   * Filters tasks based on their status.
   * Used to populate different columns in the Kanban board.
   * 
   * @param status - Status to filter tasks by ('todo', 'inProgress', 'awaitFeedback', 'done')
   * @returns Array of tasks matching the specified status
   */
  getTasksByStatus(status: string): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

  /**
   * Filters tasks based on search query
   */
  searchTasks(): void {
    if (!this.searchQuery.trim()) {
      this.resetTaskFilter();
      return;
    }
    this.applySearchFilter();
  }

  /**
   * Resets task filter to show all tasks
   */
  private resetTaskFilter(): void {
    this.filteredTasks = [...this.tasks];
  }

  /**
   * Applies search filter to tasks
   */
  private applySearchFilter(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredTasks = this.tasks.filter(task => 
      this.taskMatchesSearchQuery(task, query)
    );
  }

  /**
   * Checks if a task matches the search query
   */
  private taskMatchesSearchQuery(task: Task, query: string): boolean {
    return task.title.toLowerCase().includes(query) ||
           task.description.toLowerCase().includes(query);
  }

  /**
   * Allows dropping of dragged elements
   */
  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Initializes drag operation
   */
  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask = task;
    this.setDragEffect(event);
  }

  /**
   * Sets the drag effect for the drag operation
   */
  private setDragEffect(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  /**
   * Highlights drop target area
   */
  highlight(id: string): void {
    this.toggleHighlight(id, true);
  }

  /**
   * Removes highlight from drop target area
   */
  removeHighlight(id: string): void {
    this.toggleHighlight(id, false);
  }

  /**
   * Toggles the highlight class on a DOM element for drag and drop visualization.
   * Used to provide visual feedback during drag operations in the Kanban board.
   * 
   * @param id - The ID of the DOM element to toggle highlighting on
   * @param add - If true, adds the highlight class; if false, removes it
   * @returns void
   */
  private toggleHighlight(id: string, add: boolean): void {
    const element = document.getElementById(id);
    if (element) {
      element.classList[add ? 'add' : 'remove']('drag-area-highlight');
    }
  }

  /**
   * Moves a task to a new status in the Kanban board.
   * Handles the completion of drag and drop operations by updating task status.
   * Shows error notification if the update fails.
   * 
   * @param status - The new status to assign to the task ('todo', 'inProgress', 'awaitFeedback', 'done')
   * @returns Promise that resolves when the task is moved
   */
  async moveTo(status: string): Promise<void> {
    if (!this.isValidDragOperation()) return;
    
    try {
      await this.updateTaskStatus(status);
      this.cleanupDragOperation();
    } catch (error) {
      this.snackbarService.error('Failed to move task');
    }
  }

  /**
   * Checks if the drag operation is valid
   */
  private isValidDragOperation(): boolean {
    return Boolean(this.draggedTask && this.draggedTask.id);
  }

  /**
   * Updates the status of the dragged task
   */
  private async updateTaskStatus(status: string): Promise<void> {
    if (!this.draggedTask?.id) return;
    
    await this.taskService.updateTaskStatus(this.draggedTask.id, status);
    this.draggedTask.status = status;
    await this.loadTasks();
  }

  /**
   * Cleans up after drag operation
   */
  private cleanupDragOperation(): void {
    this.draggedTask = null;
    this.boardSections.forEach(id => this.removeHighlight(id));
  }

  /**
   * Opens a dialog to add a new task.
   * Creates and configures a Material Dialog with animation support.
   * 
   * @param initialStatus - The initial status for the new task
   * @default initialStatus 'todo'
   * @returns void
   */
  openPopupAddTask(initialStatus: string = 'todo'): void {
    const dialogRef = this.createAddTaskDialog(initialStatus);
    this.setupDialogAnimations(dialogRef);
    this.handleDialogClose(dialogRef);
  }

  /**
   * Creates and configures the add task dialog.
   * Sets up responsive sizing and styling based on screen size.
   * 
   * @param initialStatus - Initial status for the new task
   * @returns MatDialogRef instance for the created dialog
   * @private
   */
  private createAddTaskDialog(initialStatus: string) {
    return this.dialog.open(AddTaskComponent, {
      width: window.innerWidth <= 375 ? '95%' : '90%',
      maxWidth: '1000px',
      height: '90vh',
      panelClass: ['add-task-dialog', 'slide-in'],
      data: { initialStatus }
    });
  }

  /**
   * Sets up entrance and exit animations for task dialogs.
   * Manages animation classes and timing for smooth transitions.
   * 
   * @param dialogRef - Reference to the dialog being animated
   * @returns void
   * @private
   */
  private setupDialogAnimations(dialogRef: any): void {
    const backdropElement = document.querySelector('.add-task-dialog .mdc-dialog__surface') as HTMLElement;
    dialogRef.beforeClosed().subscribe(() => {
      if (backdropElement) {
        backdropElement.classList.remove('slide-in');
        backdropElement.classList.add('slide-out');
      }
    });
  }

  /**
   * Handles dialog close events for task creation.
   * Reloads task list if a new task was successfully added.
   * 
   * @param dialogRef - Reference to the dialog being closed
   * @returns void
   * @private
   */
  private handleDialogClose(dialogRef: any): void {
    dialogRef.afterClosed().subscribe(async (result: string) => {
      if (result === 'taskAdded') {
        await this.loadTasks();
      }
    });
  }

  /**
   * Opens dialog to view and edit task details.
   * Creates a configured dialog instance for the selected task.
   * 
   * @param task - The task to display details for
   * @returns void
   */
  openTaskDetails(task: Task): void {
    const dialogRef = this.createTaskDetailsDialog(task);
    this.handleTaskDetailsClose(dialogRef);
  }

  /**
   * Creates the task details dialog with specific configuration.
   * Sets up responsive sizing and styling for the dialog.
   * 
   * @param task - Task object to display details for
   * @returns MatDialogRef instance
   */
  private createTaskDetailsDialog(task: Task) {
    return this.dialog.open(TaskDetailsComponent, {
      width: '80%',
      maxWidth: '520px',
      height: '80vh',
      data: task,
      panelClass: 'custom-dialog'
    });
  }

  /**
   * Handles the task details dialog close event.
   * Reloads tasks if the task was deleted or updated.
   * 
   * @param dialogRef - Reference to the dialog instance
   * @listens MatDialogRef#afterClosed
   * @emits TaskDialogResult - 'deleted' | 'updated'
   */
  private handleTaskDetailsClose(dialogRef: any): void {
    dialogRef.afterClosed().subscribe(async (result: string) => {
      if (result === 'deleted' || result === 'updated') {
        await this.loadTasks();
      }
    });
  }
}
