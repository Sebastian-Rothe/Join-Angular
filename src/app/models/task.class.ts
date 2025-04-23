import { User } from './user.class';

export interface Subtask {
    title: string;
    completed: boolean;
}

export class Task {
    id: string; // Removed optional marker
    title: string;
    description: string;
    assignedTo: User[];
    files: File[];
    dueDate: string;
    priority: 'urgent' | 'medium' | 'low';
    category: string;
    subtasks: Subtask[];
    status: string;

    constructor(obj?: any) {
        this.id = obj?.id || ''; // Ensure it's never undefined
        this.title = obj?.title || '';
        this.description = obj?.description || '';
        this.assignedTo = obj?.assignedTo || [];
        this.files = obj?.files || [];
        this.dueDate = obj?.dueDate || '';
        this.priority = obj?.priority || 'medium';
        this.category = obj?.category || '';
        this.subtasks = obj?.subtasks || [];
        this.status = obj?.status || 'todo';
    }
}
