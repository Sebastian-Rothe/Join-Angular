import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Task, TaskFile, Subtask } from '../models/task.class';
import { UserService } from './user.service';
import { BehaviorSubject } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private taskSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.taskSubject.asObservable();

  private firestore: Firestore = inject(Firestore);

  constructor(
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  private prepareTaskForFirebase(task: Task): any {
    return {
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.map((user) => user.uid),
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      subtasks: task.subtasks,
      status: task.status,
      createdAt: new Date().getTime(),
      files: task.files || [],
    };
  }

  async createTask(task: Task): Promise<string> {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const preparedTask = this.prepareTaskForFirebase(task);
      const docRef = await addDoc(tasksCollection, preparedTask);
      return docRef.id;
    } catch (error) {
      this.snackbarService.error('Error creating task. Please try again.');
      throw error;
    }
  }

  async updateSubtaskStatus(
    taskId: string,
    updatedSubtasks: Subtask[]
  ): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskRef, { subtasks: updatedSubtasks });
      this.updateLocalTasks(taskId, { subtasks: updatedSubtasks });
    } catch (error) {
      this.snackbarService.error('Error updating subtask status. Please try again.');
      throw error;
    }
  }

  private async convertFirebaseTaskToModel(doc: any): Promise<Task> {
    const taskData = doc.data();
    const assignedUsers = await this.getAssignedUsers(taskData['assignedTo']);
    
    return new Task({
      title: taskData['title'],
      description: taskData['description'],
      dueDate: taskData['dueDate'],
      priority: taskData['priority'],
      category: taskData['category'],
      subtasks: taskData['subtasks'] || [],
      status: taskData['status'],
      files: taskData['files'] || [],
      id: doc.id,
      assignedTo: assignedUsers.filter((user) => user !== null),
    });
  }

  private async getAssignedUsers(userIds: string[] = []): Promise<any[]> {
    return Promise.all(
      userIds.map(uid => this.userService.getUserById(uid))
    );
  }

  private updateLocalTasks(taskId: string, updates: Partial<Task>): void {
    const currentTasks = this.taskSubject.value;
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    this.taskSubject.next(updatedTasks);
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const querySnapshot = await getDocs(tasksCollection);
      const tasks = await Promise.all(
        querySnapshot.docs.map(doc => this.convertFirebaseTaskToModel(doc))
      );
      this.taskSubject.next(tasks);
      return tasks;
    } catch (error) {
      this.handleError('Error loading tasks');
      throw error;
    }
  }

  private calculateTaskMetrics(tasks: Task[]): any {
    const metrics = this.initializeMetrics();
    let earliestUrgentDeadline: Date | null = null;

    tasks.forEach(task => {
      this.updateStatusMetrics(metrics, task);
      earliestUrgentDeadline = this.updateUrgentMetrics(metrics, task, earliestUrgentDeadline);
    });

    metrics.upcomingDeadline = earliestUrgentDeadline;
    return metrics;
  }

  private initializeMetrics() {
    return {
      todo: 0,
      done: 0,
      urgent: 0,
      upcomingDeadline: null as Date | null,
      tasksInBoard: 0,
      tasksInProgress: 0,
      awaitingFeedback: 0,
    };
  }

  private updateStatusMetrics(metrics: any, task: Task): void {
    metrics.tasksInBoard++;
    switch (task.status) {
      case 'todo': metrics.todo++; break;
      case 'done': metrics.done++; break;
      case 'inProgress': metrics.tasksInProgress++; break;
      case 'awaitFeedback': metrics.awaitingFeedback++; break;
    }
  }

  private updateUrgentMetrics(metrics: any, task: Task, currentEarliest: Date | null): Date | null {
    if (task.priority !== 'urgent') return currentEarliest;
    
    metrics.urgent++;
    if (!task.dueDate) return currentEarliest;

    const dueDate = new Date(task.dueDate);
    return !currentEarliest || dueDate < currentEarliest ? dueDate : currentEarliest;
  }

  async getTaskMetrics() {
    try {
      const tasks = await this.getAllTasks();
      return this.calculateTaskMetrics(tasks);
    } catch (error) {
      this.handleError('Error calculating metrics');
      throw error;
    }
  }

  private handleError(message: string): void {
    this.snackbarService.error(message + '. Please try again.');
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskRef, { status });
      this.updateLocalTasks(taskId, { status });
    } catch (error) {
      this.snackbarService.error('Error updating task status. Please try again.');
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', task.id);
      const preparedTask = this.prepareTaskForFirebase(task);
      await updateDoc(taskRef, preparedTask);
      this.updateLocalTasks(task.id, task);
      this.snackbarService.success('task successfully updated');
    } catch (error) {
      this.snackbarService.error('Error updating task. Please try again.');
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await deleteDoc(taskRef);
      this.snackbarService.success('Task successfully deleted');
    } catch (error) {
      this.snackbarService.error('Error deleting task. Please try again.');
      throw error;
    }
  }
}
