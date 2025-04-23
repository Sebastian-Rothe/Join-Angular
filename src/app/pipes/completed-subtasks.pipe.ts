import { Pipe, PipeTransform } from '@angular/core';
import { Subtask } from '../models/task.class';

@Pipe({
  name: 'completedSubtasks',
  standalone: true
})
export class CompletedSubtasksPipe implements PipeTransform {
  transform(subtasks: Subtask[]): number {
    if (!subtasks || !subtasks.length) return 0;
    return subtasks.filter(subtask => subtask.completed).length;
  }
}
