import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, Subtask } from '../../models/task.class';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public task: Task,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    private taskService: TaskService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  async toggleSubtask(subtask: Subtask): Promise<void> {
    subtask.completed = !subtask.completed;
    // Implement update logic
  }

  async deleteTask(): Promise<void> {
    // Implement delete logic
  }

  editTask(): void {
    // Implement edit logic
  }
}
