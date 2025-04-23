import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  searchQuery: string = '';
  isDropdownOpen = false;

  constructor() {}

  ngOnInit(): void {
  }

  searchTasks() {
    // Implement search logic
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
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

  moveTo(status: string) {
    // Implement move logic
  }

  openPopupAddTask() {
    // Implement popup logic
  }
}
