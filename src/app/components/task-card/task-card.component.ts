import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.class';
import { CompletedSubtasksPipe } from '../../pipes/completed-subtasks.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, CompletedSubtasksPipe],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() clicked = new EventEmitter<void>();
  @Output() dragStarted = new EventEmitter<DragEvent>();

  onDragStart(event: DragEvent) {
    this.dragStarted.emit(event);
  }

  onClick() {
    this.clicked.emit();
  }
}
