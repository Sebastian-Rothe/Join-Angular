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

/**
 * Service for managing tasks in the application
 * 
 * @class TaskService
 * @description Handles all task-related operations including CRUD operations,
 * task metrics calculation, and synchronization with Firestore
 */
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

  /**
   * Prepares a task object for Firebase storage
   * 
   * @private
   * @param {Task} task - The task to be prepared
   * @returns {any} Firebase-compatible task object
   */
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

  /**
   * Creates a new task in Firestore
   * 
   * @param {Task} task - The task to create
   * @returns {Promise<string>} The ID of the created task
   * @throws {Error} If task creation fails
   */
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

  /**
   * Updates the status of subtasks for a specific task
   * 
   * @param {string} taskId - The ID of the task
   * @param {Subtask[]} updatedSubtasks - Array of updated subtasks
   * @returns {Promise<void>}
   * @throws {Error} If subtask update fails
   */
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

  /**
   * Converts a Firestore document to a Task model
   * 
   * @private
   * @param {any} doc - Firestore document
   * @returns {Promise<Task>} Converted Task instance
   */
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

  /**
   * Fetches user data for assigned users
   * 
   * @private
   * @param {string[]} userIds - Array of user IDs
   * @returns {Promise<any[]>} Array of user data
   */
  private async getAssignedUsers(userIds: string[] = []): Promise<any[]> {
    return Promise.all(
      userIds.map(uid => this.userService.getUserById(uid))
    );
  }

  /**
   * Updates local task state
   * 
   * @private
   * @param {string} taskId - Task ID to update
   * @param {Partial<Task>} updates - Partial task data to apply
   */
  private updateLocalTasks(taskId: string, updates: Partial<Task>): void {
    const currentTasks = this.taskSubject.value;
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    this.taskSubject.next(updatedTasks);
  }

  /**
   * Retrieves all tasks from Firestore
   * 
   * @returns {Promise<Task[]>} Array of all tasks
   * @throws {Error} If task retrieval fails
   */
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

  /**
   * Calculates metrics for tasks
   * 
   * @private
   * @param {Task[]} tasks - Array of tasks to analyze
   * @returns {any} Object containing calculated metrics
   */
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

  /**
   * Initializes metrics object with default values
   * 
   * @private
   * @returns {Object} Default metrics object
   */
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

  /**
   * Updates status-related metrics
   * 
   * @private
   * @param {any} metrics - Metrics object to update
   * @param {Task} task - Task to analyze
   */
  private updateStatusMetrics(metrics: any, task: Task): void {
    metrics.tasksInBoard++;
    switch (task.status) {
      case 'todo': metrics.todo++; break;
      case 'done': metrics.done++; break;
      case 'inProgress': metrics.tasksInProgress++; break;
      case 'awaitFeedback': metrics.awaitingFeedback++; break;
    }
  }

  /**
   * Updates urgent task metrics
   * 
   * @private
   * @param {any} metrics - Metrics object to update
   * @param {Task} task - Task to analyze
   * @param {Date | null} currentEarliest - Current earliest deadline
   * @returns {Date | null} Updated earliest deadline
   */
  private updateUrgentMetrics(metrics: any, task: Task, currentEarliest: Date | null): Date | null {
    if (task.priority !== 'urgent') return currentEarliest;
    
    metrics.urgent++;
    if (!task.dueDate) return currentEarliest;

    const dueDate = new Date(task.dueDate);
    return !currentEarliest || dueDate < currentEarliest ? dueDate : currentEarliest;
  }

  /**
   * Retrieves and calculates task metrics
   * 
   * @returns {Promise<any>} Object containing task metrics
   * @throws {Error} If metrics calculation fails
   */
  async getTaskMetrics() {
    try {
      const tasks = await this.getAllTasks();
      return this.calculateTaskMetrics(tasks);
    } catch (error) {
      this.handleError('Error calculating metrics');
      throw error;
    }
  }

  /**
   * Handles error messages consistently
   * 
   * @private
   * @param {string} message - Error message to display
   */
  private handleError(message: string): void {
    this.snackbarService.error(message + '. Please try again.');
  }

  /**
   * Updates the status of a task
   * 
   * @param {string} taskId - ID of the task to update
   * @param {string} status - New status value
   * @returns {Promise<void>}
   * @throws {Error} If status update fails
   */
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

  /**
   * Updates an existing task
   * 
   * @param {Task} task - Updated task data
   * @returns {Promise<void>}
   * @throws {Error} If task update fails
   */
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

  /**
   * Deletes a task
   * 
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise<void>}
   * @throws {Error} If task deletion fails
   */
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
