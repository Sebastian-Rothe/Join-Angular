import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.class';
import { CompletedSubtasksPipe } from '../../pipes/completed-subtasks.pipe';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, CompletedSubtasksPipe],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  searchQuery: string = '';
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isDropdownOpen = false;
  draggedTask: Task | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
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

  openPopupAddTask() {
    // Implement popup logic
  }
}
