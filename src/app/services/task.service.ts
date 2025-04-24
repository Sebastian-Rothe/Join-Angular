import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Task } from '../models/task.class';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore: Firestore = inject(Firestore);

  constructor(private userService: UserService) {}

  private async prepareTaskForFirebase(task: Task): Promise<any> {
    // Komprimiere alle Files zu Base64
    const compressedFiles = task.files?.length ? 
      await Promise.all(task.files.map(file => this.userService.compressImage(file))) : 
      [];

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
      files: compressedFiles
    };
  }

  async createTask(task: Task): Promise<string> {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const preparedTask = await this.prepareTaskForFirebase(task);
      const docRef = await addDoc(tasksCollection, preparedTask);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

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
          id: doc.id,
          assignedTo: assignedUsers.filter(user => user !== null)
        });
        tasks.push(task);
      }
      
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
}
