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

interface ImageInfo {
  url: string;
  name: string;
  size: number;
}

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, ImageViewerComponent],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent implements OnInit {
  @ViewChild('fileGrid') fileGrid!: ElementRef;

  // Properties
  private isDraggingGrid = false;
  private startX = 0;
  private scrollLeft = 0;
  isDescriptionLong = false;
  isCollapsed = true;
  showImageViewer = false;
  currentImageIndex = 0;
  images: ImageInfo[] = [];

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

  ngOnInit() {
    this.initializeImages();
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

  private getBase64Size(base64String: string): number {
    const padding = this.calculateBase64Padding(base64String);
    return base64String.length * 0.75 - padding;
  }

  /**
   * Calculate padding for base64 string
   * @private
   */
  private calculateBase64Padding(base64String: string): number {
    return base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  }

  toggleDescription(): void {
    if (this.isDescriptionLong) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

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
   */
  private async updateSubtaskInDatabase(subtask: Subtask): Promise<void> {
    await this.taskService.updateSubtaskStatus(this.task.id, this.task.subtasks);
  }

  /**
   * Handle subtask update error
   * @private
   */
  private handleSubtaskUpdateError(subtask: Subtask, previousState: boolean): void {
    this.snackbarService.error('Failed to update subtask status.');
    subtask.completed = previousState;
  }

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
   */
  private showDeleteConfirmation() {
    return this.snackbarService.confirm({ 
      message: 'Are you sure you want to delete this task?' 
    });
  }

  /**
   * Perform task deletion
   * @private
   */
  private async performTaskDeletion(): Promise<void> {
    try {
      await this.taskService.deleteTask(this.task.id);
      this.dialogRef.close('deleted');
    } catch (error) {
      this.snackbarService.error('Failed to delete task.');
    }
  }

  editTask(): void {
    const dialogRef = this.openEditDialog();
    this.handleEditDialogClose(dialogRef);
  }

  /**
   * Open edit task dialog
   * @private
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
   */  private handleEditDialogClose(dialogRef: MatDialogRef<AddTaskComponent>): void {
    dialogRef.afterClosed().subscribe((result: 'taskUpdated' | undefined) => {
      if (result === 'taskUpdated') {
        this.dialogRef.close('updated');
      }
    });
    this.close();
  }

  getFormattedDate(timestamp: any): Date {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  // File Grid Handling Methods
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (this.fileGrid) {
      this.fileGrid.nativeElement.scrollLeft += event.deltaY;
    }
  }

  startDragging(event: MouseEvent): void {
    this.isDraggingGrid = true;
    this.startX = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    this.scrollLeft = this.fileGrid.nativeElement.scrollLeft;
    this.updateGridCursor('grabbing');
  }

  stopDragging(): void {
    this.isDraggingGrid = false;
    this.updateGridCursor('grab');
  }

  /**
   * Update grid cursor style
   * @private
   */
  private updateGridCursor(cursorStyle: string): void {
    this.fileGrid.nativeElement.style.cursor = cursorStyle;
  }

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
   */
  private calculateDragDistance(currentX: number): number {
    return (currentX - this.startX) * 2;
  }

  /**
   * Update grid scroll position
   * @private
   */
  private updateGridScroll(walk: number): void {
    this.fileGrid.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

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
   */
  private generateFilenameFromType(base64String: string): string | null {
    const typeMatch = base64String.match(/^data:image\/([^;]+);/);
    if (typeMatch && typeMatch[1]) {
      return `Image.${typeMatch[1]}`;
    }
    return null;
  }

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
   */
  private triggerDownload(link: HTMLAnchorElement): void {
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openImageViewer(index: number): void {
    if (this.task.files[index]?.data) {
      this.currentImageIndex = index;
      this.showImageViewer = true;
    }
  }

  onCurrentIndexChange(index: number): void {
    this.currentImageIndex = index;
  }
}
