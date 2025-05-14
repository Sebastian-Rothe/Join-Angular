import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { Task, Subtask, TaskFile } from '../../models/task.class';
import { TaskService } from '../../services/task.service';
import { ImageViewerComponent } from '../../shared/components/image-viewer/image-viewer.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { SnackbarService } from '../../services/snackbar.service';

/** Interface for image information display */
interface ImageInfo {
  /** URL or base64 data of the image */
  url: string;
  /** Name of the image file */
  name: string;
  /** Size of the image in bytes */
  size: number;
}

/**
 * Component that displays detailed information about a task.
 * Provides functionality for viewing, editing, and managing task details,
 * including description, subtasks, file attachments, and image viewing.
 */
@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, ImageViewerComponent],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent implements OnInit {
  /** Reference to the file grid element for drag scroll functionality */
  @ViewChild('fileGrid') fileGrid!: ElementRef;

  /** Flag indicating if the file grid is being dragged */
  private isDraggingGrid = false;
  
  /** Starting X position for drag scroll */
  private startX = 0;
  
  /** Initial scroll position for drag scroll */
  private scrollLeft = 0;
  
  /** Indicates if the description is long enough to be collapsible */
  isDescriptionLong = false;
  
  /** Controls the collapsed state of the description */
  isCollapsed = true;
  
  /** Controls the visibility of the image viewer */
  showImageViewer = false;
  
  /** Index of the currently viewed image */
  currentImageIndex = 0;
  
  /** Array of image information for display */
  images: ImageInfo[] = [];

  /**
   * Creates an instance of TaskDetailsComponent.
   * @param {Task} task - The task data to display
   * @param {MatDialogRef<TaskDetailsComponent>} dialogRef - Reference to the dialog
   * @param {TaskService} taskService - Service for managing tasks
   * @param {MatDialog} dialog - Service for opening dialogs
   * @param {SnackbarService} snackbarService - Service for showing notifications
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public task: Task,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) {
    this.checkDescriptionLength();
  }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Initializes the images array from task files.
   */
  ngOnInit() {
    this.initializeImages();
  }

  /**
   * Check if description is long enough to be collapsible
   * @private
   */
  private checkDescriptionLength(): void {
    if (this.task.description) {
      const tempElement = this.createTempElement();
      const height = this.measureElementHeight(tempElement);
      this.isDescriptionLong = height > 72; // Assuming ~24px per line (20px font + line-height), check if more than 3 lines
    }
  }

  /**
   * Creates a temporary element to measure text height
   * @private
   */
  private createTempElement(): HTMLElement {
    const tempElement = document.createElement('p');
    tempElement.style.cssText = 'font-size: 20px; width: 100%; position: absolute; visibility: hidden;';
    tempElement.textContent = this.task.description;
    document.body.appendChild(tempElement);
    return tempElement;
  }

  /**
   * Measures the height of an element and removes it
   * @private
   */
  private measureElementHeight(element: HTMLElement): number {
    const height = element.offsetHeight;
    document.body.removeChild(element);
    return height;
  }

  /**
   * Initialize images array from task files
   * @private
   */
  private initializeImages(): void {
    if (this.task.files) {
      this.images = this.task.files.map((file) => ({
        url: file.data,
        name: file.name,
        size: this.getBase64Size(file.data),
      }));
    }
  }

  /**
   * Calculate the size of a base64 string in bytes
   * @private
   * @param {string} base64String - The base64 string
   * @returns {number} The size in bytes
   */
  private getBase64Size(base64String: string): number {
    const padding = this.calculateBase64Padding(base64String);
    return base64String.length * 0.75 - padding;
  }

  /**
   * Calculate padding for base64 string
   * @private
   * @param {string} base64String - The base64 string
   * @returns {number} The padding size
   */
  private calculateBase64Padding(base64String: string): number {
    return base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  }

  /**
   * Toggles the visibility of the task description when it's long.
   * Only toggles if the description is longer than the display threshold.
   */
  toggleDescription(): void {
    if (this.isDescriptionLong) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  /**
   * Closes the task details dialog.
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Toggles the completion status of a subtask.
   * Updates the status in the database and handles errors.
   * @param {Subtask} subtask - The subtask to toggle
   * @returns {Promise<void>}
   */
  async toggleSubtask(subtask: Subtask): Promise<void> {
    const previousState = subtask.completed;
    subtask.completed = !subtask.completed;
    
    try {
      await this.updateSubtaskInDatabase(subtask);
    } catch (error) {
      this.handleSubtaskUpdateError(subtask, previousState);
    }
  }

  /**
   * Update subtask status in database
   * @private
   * @param {Subtask} subtask - The subtask to update
   * @returns {Promise<void>}
   */
  private async updateSubtaskInDatabase(subtask: Subtask): Promise<void> {
    await this.taskService.updateSubtaskStatus(this.task.id, this.task.subtasks);
  }

  /**
   * Handle subtask update error
   * @private
   * @param {Subtask} subtask - The subtask that failed to update
   * @param {boolean} previousState - The previous completion state
   */
  private handleSubtaskUpdateError(subtask: Subtask, previousState: boolean): void {
    this.snackbarService.error('Failed to update subtask status.');
    subtask.completed = previousState;
  }

  /**
   * Initiates the task deletion process.
   * Shows a confirmation dialog before deleting.
   * @returns {Promise<void>}
   */
  async deleteTask(): Promise<void> {
    this.showDeleteConfirmation().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.performTaskDeletion();
      }
    });
  }

  /**
   * Show delete confirmation dialog
   * @private
   * @returns {Observable<boolean>} Observable emitting the confirmation result
   */
  private showDeleteConfirmation() {
    return this.snackbarService.confirm({ 
      message: 'Are you sure you want to delete this task?' 
    });
  }

  /**
   * Perform task deletion
   * @private
   * @returns {Promise<void>}
   */
  private async performTaskDeletion(): Promise<void> {
    try {
      await this.taskService.deleteTask(this.task.id);
      this.dialogRef.close('deleted');
    } catch (error) {
      this.snackbarService.error('Failed to delete task.');
    }
  }

  /**
   * Opens the edit task dialog.
   * Handles the result of editing operation.
   */
  editTask(): void {
    const dialogRef = this.openEditDialog();
    this.handleEditDialogClose(dialogRef);
  }

  /**
   * Open edit task dialog
   * @private
   * @returns {MatDialogRef<AddTaskComponent>} Reference to the dialog
   */
  private openEditDialog() {
    return this.dialog.open(AddTaskComponent, {
      width: '90%',
      maxWidth: '1000px',
      height: '90vh',
      data: {
        isEditMode: true,
        taskToEdit: this.task,
      },
    });
  }

  /**
   * Handle edit dialog close
   * @private
   * @param {MatDialogRef<AddTaskComponent>} dialogRef - Reference to the dialog
   */
  private handleEditDialogClose(dialogRef: MatDialogRef<AddTaskComponent>): void {
    dialogRef.afterClosed().subscribe((result: 'taskUpdated' | undefined) => {
      if (result === 'taskUpdated') {
        this.dialogRef.close('updated');
      }
    });
    this.close();
  }

  /**
   * Formats a timestamp into a Date object.
   * Handles both Firebase timestamps and regular dates.
   * @param {any} timestamp - The timestamp to format
   * @returns {Date} The formatted date
   */
  getFormattedDate(timestamp: any): Date {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  /**
   * Handles mouse wheel events on the file grid.
   * Enables horizontal scrolling of the grid.
   * @param {WheelEvent} event - The wheel event
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (this.fileGrid) {
      this.fileGrid.nativeElement.scrollLeft += event.deltaY;
    }
  }

  /**
   * Initializes drag scrolling of the file grid.
   * @param {MouseEvent} event - The mouse event
   */
  startDragging(event: MouseEvent): void {
    this.isDraggingGrid = true;
    this.startX = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    this.scrollLeft = this.fileGrid.nativeElement.scrollLeft;
    this.updateGridCursor('grabbing');
  }

  /**
   * Ends drag scrolling of the file grid.
   */
  stopDragging(): void {
    this.isDraggingGrid = false;
    this.updateGridCursor('grab');
  }

  /**
   * Update grid cursor style
   * @private
   * @param {string} cursorStyle - The cursor style to apply
   */
  private updateGridCursor(cursorStyle: string): void {
    this.fileGrid.nativeElement.style.cursor = cursorStyle;
  }

  /**
   * Handles drag events on the file grid.
   * Updates scroll position based on drag movement.
   * @param {MouseEvent} event - The mouse event
   */
  onDrag(event: MouseEvent): void {
    if (!this.isDraggingGrid) return;
    event.preventDefault();
    
    const x = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    const walk = this.calculateDragDistance(x);
    this.updateGridScroll(walk);
  }

  /**
   * Calculate drag distance
   * @private
   * @param {number} currentX - The current X position
   * @returns {number} The calculated drag distance
   */
  private calculateDragDistance(currentX: number): number {
    return (currentX - this.startX) * 2;
  }

  /**
   * Update grid scroll position
   * @private
   * @param {number} walk - The distance to scroll
   */
  private updateGridScroll(walk: number): void {
    this.fileGrid.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  /**
   * Extracts or generates a filename from a base64 string.
   * @param {string} base64String - The base64 string containing the file data
   * @returns {string} The extracted or generated filename
   */
  getFileName(base64String: string): string {
    try {
      const filename = this.extractFilenameFromMetadata(base64String);
      if (filename) return filename;

      const typeBasedName = this.generateFilenameFromType(base64String);
      if (typeBasedName) return typeBasedName;

      return 'Image';
    } catch (error) {
      this.snackbarService.error('Error extracting filename.');
      return 'Image';
    }
  }

  /**
   * Extract filename from base64 metadata
   * @private
   * @param {string} base64String - The base64 string containing metadata
   * @returns {string | null} The extracted filename or null
   */
  private extractFilenameFromMetadata(base64String: string): string | null {
    const match = base64String.match(/^data:image\/[^;]+;name=([^;]+);base64,/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  }

  /**
   * Generate filename based on image type
   * @private
   * @param {string} base64String - The base64 string containing the file data
   * @returns {string | null} The generated filename or null
   */
  private generateFilenameFromType(base64String: string): string | null {
    const typeMatch = base64String.match(/^data:image\/([^;]+);/);
    if (typeMatch && typeMatch[1]) {
      return `Image.${typeMatch[1]}`;
    }
    return null;
  }

  /**
   * Downloads a file attachment.
   * @param {TaskFile} file - The file to download
   */
  downloadFile(file: TaskFile): void {
    try {
      const link = this.createDownloadLink(file);
      this.triggerDownload(link);
    } catch (error) {
      this.snackbarService.error('Failed to download file.');
    }
  }

  /**
   * Create download link element
   * @private
   * @param {TaskFile} file - The file to create a link for
   * @returns {HTMLAnchorElement} The created link element
   */
  private createDownloadLink(file: TaskFile): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    return link;
  }

  /**
   * Trigger file download
   * @private
   * @param {HTMLAnchorElement} link - The link element to trigger download
   */
  private triggerDownload(link: HTMLAnchorElement): void {
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Opens the image viewer for a specific image.
   * @param {number} index - The index of the image to view
   */
  openImageViewer(index: number): void {
    if (this.task.files[index]?.data) {
      this.currentImageIndex = index;
      this.showImageViewer = true;
    }
  }

  /**
   * Updates the current image index in the viewer.
   * @param {number} index - The new image index
   */
  onCurrentIndexChange(index: number): void {
    this.currentImageIndex = index;
  }
}
