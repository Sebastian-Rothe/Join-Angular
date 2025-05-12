import { Pipe, PipeTransform } from '@angular/core';
import { Subtask } from '../../models/task.class';

/**
 * A pipe that counts the number of completed subtasks in an array of subtasks.
 * 
 * @description
 * This pipe takes an array of Subtask objects and returns the count of subtasks
 * that have their 'completed' property set to true.
 * 
 * @example
 * ```html
 * <!-- In template -->
 * <div>Completed: {{ subtasks | completedSubtasks }}</div>
 * ```
 * 
 * @example
 * ```typescript
 * // Example input
 * const subtasks = [
 *   { title: 'Task 1', completed: true },
 *   { title: 'Task 2', completed: false },
 *   { title: 'Task 3', completed: true }
 * ];
 * // Output: 2
 * ```
 */
@Pipe({
  name: 'completedSubtasks',
  standalone: true
})
export class CompletedSubtasksPipe implements PipeTransform {
  /**
   * Transforms an array of subtasks into a count of completed subtasks.
   * 
   * @param subtasks - The array of Subtask objects to process
   * @returns The number of completed subtasks, or 0 if the input is invalid
   */
  transform(subtasks: Subtask[]): number {
    if (!subtasks || !subtasks.length) return 0;
    return subtasks.filter(subtask => subtask.completed).length;
  }
}
