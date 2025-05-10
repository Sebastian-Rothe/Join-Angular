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

      // Update local tasks
      const currentTasks = this.taskSubject.value;
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId ? { ...task, subtasks: updatedSubtasks } : task
      );
      this.taskSubject.next(updatedTasks);
    } catch (error) {
      this.snackbarService.error('Error updating subtask status. Please try again.');
      throw error;
    }
  }

  // Modify getAllTasks to use BehaviorSubject
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const querySnapshot = await getDocs(tasksCollection);
      const tasks: Task[] = [];

      for (const doc of querySnapshot.docs) {
        const taskData = doc.data() as { [key: string]: any };
        const assignedUsers = await Promise.all(
          taskData['assignedTo']?.map((uid: string) =>
            this.userService.getUserById(uid)
          ) || []
        );

        const task = new Task({
          title: taskData['title'],
          description: taskData['description'],
          dueDate: taskData['dueDate'],
          priority: taskData['priority'],
          category: taskData['category'],
          subtasks: taskData['subtasks'] || [],
          status: taskData['status'],
          files: taskData['files'] || [], // TaskFile objects are retrieved directly
          id: doc.id,
          assignedTo: assignedUsers.filter((user) => user !== null),
        });
        tasks.push(task);
      }
      this.taskSubject.next(tasks);
      return tasks;
    } catch (error) {
      this.snackbarService.error('Error loading tasks. Please try again.');
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskRef, { status });

      // Update local tasks
      const currentTasks = this.taskSubject.value;
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      this.taskSubject.next(updatedTasks);
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

      // Update local tasks
      const currentTasks = this.taskSubject.value;
      const updatedTasks = currentTasks.map((t) =>
        t.id === task.id ? task : t
      );
      this.taskSubject.next(updatedTasks);
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

  async getTaskMetrics() {
    try {
      const tasks = await this.getAllTasks();

      const metrics = {
        todo: 0,
        done: 0,
        urgent: 0,
        upcomingDeadline: null as Date | null,
        tasksInBoard: tasks.length,
        tasksInProgress: 0,
        awaitingFeedback: 0,
      };

      let earliestUrgentDeadline: Date | null = null;

      tasks.forEach((task) => {
        switch (
          task.status // Remove normalization since we know the exact values
        ) {
          case 'todo':
            metrics.todo++;
            break;
          case 'done':
            metrics.done++;
            break;
          case 'inProgress': // Matches exactly what's in Firebase
            metrics.tasksInProgress++;
            break;
          case 'awaitFeedback': // Matches exactly what's in Firebase
            metrics.awaitingFeedback++;
            break;
        }

        if (task.priority === 'urgent') {
          metrics.urgent++;
          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            if (!earliestUrgentDeadline || dueDate < earliestUrgentDeadline) {
              earliestUrgentDeadline = dueDate;
            }
          }
        }
      });
      metrics.upcomingDeadline = earliestUrgentDeadline;
      return metrics;
    } catch (error) {
      this.snackbarService.error('Error calculating metrics. Please try again.');
      throw error;
    }
  }
}
