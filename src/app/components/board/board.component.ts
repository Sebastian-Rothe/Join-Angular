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
  searchQuery: string = '';
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isDropdownOpen = false;
  draggedTask: Task | null = null;

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.taskService.tasks$.subscribe(tasks => {
      if (tasks.length > 0) {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
      }
    });
  }

  async loadTasks() {
    try {
      this.tasks = await this.taskService.getAllTasks();
      this.filteredTasks = [...this.tasks];
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  getTasksByStatus(status: string): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

  searchTasks() {
    if (!this.searchQuery.trim()) {
      this.filteredTasks = [...this.tasks];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredTasks = this.tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDragStart(event: DragEvent, task: Task) {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  highlight(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('drag-area-highlight');
    }
  }

  removeHighlight(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('drag-area-highlight');
    }
  }

  async moveTo(status: string) {
    if (!this.draggedTask || !this.draggedTask.id) return;
    
    try {
      await this.taskService.updateTaskStatus(this.draggedTask.id, status);
      this.draggedTask.status = status;
      this.draggedTask = null;
      await this.loadTasks();
      
      // Remove all highlight lines after drop
      ['todoBoard', 'inProgressBoard', 'awaitFeedbackBoard', 'doneBoard'].forEach(id => {
        this.removeHighlight(id);
      });
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }

  openPopupAddTask(initialStatus: string = 'todo') {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '90%',
      maxWidth: '1000px',
      height: '90vh',
      panelClass: 'add-task-dialog',
      enterAnimationDuration: '225ms',
      exitAnimationDuration: '195ms',
      data: { initialStatus }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'taskAdded') {
        await this.loadTasks();
      }
    });
  }

  openTaskDetails(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailsComponent, {
      width: '80%',
      maxWidth: '520px',
      height: '80vh',
      data: task,
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'deleted' || result === 'updated') {
        await this.loadTasks(); // Aktualisiere die Task-Liste
      }
    });
  }
}
