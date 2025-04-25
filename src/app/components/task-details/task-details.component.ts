import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, Subtask, TaskFile } from '../../models/task.class';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent {
  @ViewChild('fileGrid') fileGrid!: ElementRef;
  
  // Add missing properties
  private isDraggingGrid = false;
  private startX = 0;
  private scrollLeft = 0;
  isDescriptionLong = false;
  isCollapsed = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public task: Task,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    private taskService: TaskService
  ) {
    // Check if description is long enough to be collapsible
    if (this.task.description) {
      const tempElement = document.createElement('p');
      tempElement.style.cssText = 'font-size: 20px; width: 100%; position: absolute; visibility: hidden;';
      tempElement.textContent = this.task.description;
      document.body.appendChild(tempElement);
      const height = tempElement.offsetHeight;
      document.body.removeChild(tempElement);
      
      // Assuming ~24px per line (20px font + line-height), check if more than 3 lines
      this.isDescriptionLong = height > 72;
    }
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
    subtask.completed = !subtask.completed;
    // Implement update logic
  }

  async deleteTask(): Promise<void> {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await this.taskService.deleteTask(this.task.id);
        this.dialogRef.close('deleted');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  }

  editTask(): void {
    // Implement edit logic
  }

  getFormattedDate(timestamp: any): Date {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

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
    this.fileGrid.nativeElement.style.cursor = 'grabbing';
  }

  stopDragging(): void {
    this.isDraggingGrid = false;
    this.fileGrid.nativeElement.style.cursor = 'grab';
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDraggingGrid) return;
    event.preventDefault();
    const x = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.fileGrid.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  getFileName(base64String: string): string {
    try {
      // Extrahiere den Dateinamen aus dem Base64-Metadaten
      const match = base64String.match(/^data:image\/[^;]+;name=([^;]+);base64,/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
      
      // Fallback: Generiere einen Namen basierend auf dem Bildtyp
      const typeMatch = base64String.match(/^data:image\/([^;]+);/);
      if (typeMatch && typeMatch[1]) {
        return `Image.${typeMatch[1]}`;
      }
      
      return 'Image';
    } catch (error) {
      console.error('Error extracting filename:', error);
      return 'Image';
    }
  }

  downloadFile(file: TaskFile): void {
    try {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  ngOnDestroy(): void {
    // Keine Cleanup nötig da wir Base64 statt Blob URLs verwenden
  }
}
