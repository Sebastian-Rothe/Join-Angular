import { User } from './user.class';

export interface Subtask {
    title: string;
    completed: boolean;
}

export interface TaskFile {
    data: string;  // base64 string
    name: string;
    type: string;
}

export class Task {
    id: string; // Removed optional marker
    title: string;
    description: string;
    assignedTo: User[];
    files: TaskFile[] = []; // Updated to use TaskFile interface
    fileNames: string[] = []; // Store file names separately
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
        this.fileNames = obj?.fileNames || [];
        this.dueDate = obj?.dueDate ? new Date(obj.dueDate).getTime() : 0; // Convert dueDate to timestamp
        this.priority = obj?.priority || 'medium';
        this.category = obj?.category || '';
        this.subtasks = obj?.subtasks || [];
        this.status = obj?.status || 'todo';
    }
}
