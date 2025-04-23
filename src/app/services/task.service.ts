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

  async createTask(task: Task): Promise<string> {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const docRef = await addDoc(tasksCollection, this.prepareTaskForFirebase(task));
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  private prepareTaskForFirebase(task: Task): any {
    return {
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.map(user => user.uid), // Nur IDs speichern
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      subtasks: task.subtasks,
      status: task.status,
      createdAt: new Date().getTime(),
      // files müssen separat im Storage gespeichert werden
    };
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
}
