import { User } from './user.class';

/**
 * Interface representing a subtask within a task.
 * 
 * @interface Subtask
 * @property {string} title - The title of the subtask
 * @property {boolean} completed - The completion status of the subtask
 */
export interface Subtask {
    title: string;
    completed: boolean;
}

/**
 * Interface representing a file attached to a task.
 * 
 * @interface TaskFile
 * @property {string} data - The file content as a base64 encoded string
 * @property {string} name - The original filename
 * @property {string} type - The MIME type of the file
 */
export interface TaskFile {
    data: string;  // base64 string
    name: string;
    type: string;
}

/**
 * Class representing a task in the task management system.
 * 
 * @description
 * This class handles all task-related data including basic task information,
 * assigned users, files, subtasks, and status management.
 * 
 * @class Task
 * @property {string} id - Unique identifier for the task
 * @property {string} title - The task title
 * @property {string} description - Detailed description of the task
 * @property {User[]} assignedTo - Array of users assigned to the task
 * @property {TaskFile[]} files - Array of files attached to the task
 * @property {number} dueDate - Task due date as Unix timestamp
 * @property {('urgent' | 'medium' | 'low')} priority - Task priority level
 * @property {string} category - Task category
 * @property {Subtask[]} subtasks - Array of subtasks
 * @property {string} status - Current status of the task
 * 
 * @example
 * ```typescript
 * const task = new Task({
 *   title: 'Complete documentation',
 *   priority: 'high',
 *   dueDate: '2024-01-01'
 * });
 * ```
 */
export class Task {
    id: string; // Removed optional marker
    title: string;
    description: string;
    assignedTo: User[];
    files: TaskFile[] = []; // Updated to use TaskFile interface
    dueDate: number; // Updated to store dueDate as a timestamp
    priority: 'urgent' | 'medium' | 'low';
    category: string;
    subtasks: Subtask[];
    status: string;

    constructor(obj?: any) {
        this.id = obj?.id || ''; // Ensure it's never undefined
        this.title = obj?.title || '';
        this.description = obj?.description || '';
        this.assignedTo = obj?.assignedTo || [];
        this.files = obj?.files || []; // Updated to use TaskFile interface
        this.dueDate = obj?.dueDate ? new Date(obj.dueDate).getTime() : 0; // Convert dueDate to timestamp
        this.priority = obj?.priority || 'medium';
        this.category = obj?.category || '';
        this.subtasks = obj?.subtasks || [];
        this.status = obj?.status || 'todo';
    }
}
