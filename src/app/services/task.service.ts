import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Task, TaskFile, Subtask } from '../models/task.class';
import { UserService } from './user.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private taskSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.taskSubject.asObservable();

  private firestore: Firestore = inject(Firestore);

  constructor(private userService: UserService) {}

  private prepareTaskForFirebase(task: Task): any {
    return {
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.map(user => user.uid),
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      subtasks: task.subtasks,
      status: task.status,
      createdAt: new Date().getTime(),
      files: task.files || [] // TaskFile objects can be stored directly
    };
  }

  async createTask(task: Task): Promise<string> {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const preparedTask = this.prepareTaskForFirebase(task);
      const docRef = await addDoc(tasksCollection, preparedTask);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateSubtaskStatus(taskId: string, updatedSubtasks: Subtask[]): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskRef, { subtasks: updatedSubtasks });
      
      // Update local tasks
      const currentTasks = this.taskSubject.value;
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, subtasks: updatedSubtasks } : task
      );
      this.taskSubject.next(updatedTasks);
    } catch (error) {
      console.error('Error updating subtask status:', error);
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
          taskData['assignedTo']?.map((uid: string) => this.userService.getUserById(uid)) || []
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
          assignedTo: assignedUsers.filter(user => user !== null)
        });
        tasks.push(task);
      }
      this.taskSubject.next(tasks);
      return tasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskRef, { status });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', task.id);
      const preparedTask = this.prepareTaskForFirebase(task);
      await updateDoc(taskRef, preparedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}
