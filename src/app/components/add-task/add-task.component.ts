import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';

interface Contact {
  uid?: string;
  name: string;
  email: string;
  initials?: string;
  iconColor?: string;
  profilePicture?: string;
}

interface Subtask {
  title: string;
  completed: boolean;
}

interface Task {
  title: string;
  description: string;
  assignedTo: Contact[];
  files: File[];
  dueDate: string;
  priority: 'urgent' | 'medium' | 'low';
  category: string;
  subtasks: Subtask[];
  status: string;
}

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit {
  categories = [
    { value: 'TechnicalTask', label: 'Technical Task' },
    { value: 'UserStory', label: 'User Story' }
  ];
  categoryOpen: boolean = false;
  
  task: Task = {
    title: '',
    description: '',
    assignedTo: [],
    files: [],
    dueDate: '',
    priority: 'medium',
    category: '',
    subtasks: [],
    status: 'todo'
  };

  contacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  dropdownOpen = false;
  
  newSubtask = '';
  isSubtaskInputActive = false;
  
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';
  
  errors = {
    title: false,
    dueDate: false,
    category: false
  };

  currentUser: Contact | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setupCurrentUser();  // Load current user first
    this.loadContacts();
  }

  private setupCurrentUser(): void {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        const userDoc = await this.userService.getUserById(user.uid);
        if (userDoc) {
          this.currentUser = {
            uid: userDoc.uid,
            name: userDoc.name,
            email: userDoc.email,
            initials: userDoc.initials,
            iconColor: userDoc.iconColor,
            profilePicture: userDoc.profilePicture
          };
          this.selectedContacts = [this.currentUser];
          this.task.assignedTo = [this.currentUser];
          this.sortContacts(); // Sort contacts after current user is set
        }
      }
    });
  }

  private sortContacts(): void {
    this.contacts.sort((a, b) => {
      if (a.uid === this.currentUser?.uid) return -1;
      if (b.uid === this.currentUser?.uid) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  async loadContacts(): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      this.contacts = users.map(user => ({
        uid: user.uid,
        name: user.name,
        email: user.email,
        initials: user.initials,
        iconColor: user.iconColor,
        profilePicture: user.profilePicture
      }));
      if (this.currentUser) {
        this.sortContacts(); // Sort if current user is already loaded
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('Failed to load users');
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.some(c => c.uid === contact.uid);
  }

  toggleContact(contact: Contact): void {
    const index = this.selectedContacts.findIndex(c => c.uid === contact.uid);
    
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
    
    this.task.assignedTo = [...this.selectedContacts];
  }

  removeContact(contact: Contact): void {
    const index = this.selectedContacts.findIndex(c => c.uid === contact.uid);
    if (index !== -1) {
      this.selectedContacts.splice(index, 1);
      this.task.assignedTo = [...this.selectedContacts];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
      const files = Array.from(input.files);
      
      for (const file of files) {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(extension)) {
          this.showError(`File "${file.name}" has invalid type. Only jpg, jpeg, png, and pdf files are allowed.`);
          return;
        }
      }
      
      this.task.files = [...(this.task.files || []), ...files];
    }
  }

  removeFile(index: number): void {
    this.task.files.splice(index, 1);
  }

  selectPriority(priority: 'urgent' | 'medium' | 'low'): void {
    this.task.priority = priority;
  }

  subTaskInput(): void {
    this.isSubtaskInputActive = this.newSubtask.trim().length > 0;
  }

  activateSubtaskInput(): void {
    this.isSubtaskInputActive = true;
  }

  clearSubtaskInput(): void {
    this.newSubtask = '';
    this.isSubtaskInputActive = false;
  }

  addSubtask(): void {
    if (this.newSubtask.trim()) {
      this.task.subtasks.push({
        title: this.newSubtask.trim(),
        completed: false
      });
      this.clearSubtaskInput();
    }
  }

  editSubtask(index: number): void {
    this.newSubtask = this.task.subtasks[index].title;
    this.isSubtaskInputActive = true;
    this.deleteSubtask(index);
  }

  deleteSubtask(index: number): void {
    this.task.subtasks.splice(index, 1);
  }

  validateForm(): boolean {
    this.errors = {
      title: !this.task.title.trim(),
      dueDate: !this.task.dueDate,
      category: !this.task.category
    };
    
    return !this.errors.title && !this.errors.dueDate && !this.errors.category;
  }

  createTask(): void {
    if (this.validateForm()) {
      console.log('Saving task:', this.task);
      
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
        this.clearForm();
      }, 2000);
    }
  }

  clearForm(): void {
    this.task = {
      title: '',
      description: '',
      assignedTo: [],
      files: [],
      dueDate: '',
      priority: 'medium',
      category: '',
      subtasks: [],
      status: 'todo'
    };
    this.selectedContacts = [];
    this.clearSubtaskInput();
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorMessage = true;
    setTimeout(() => {
      this.showErrorMessage = false;
    }, 3000);
  }

  toggleCategory(): void {
    this.categoryOpen = !this.categoryOpen;
    if (this.categoryOpen) {
      setTimeout(() => {
        const element = document.querySelector('.category-wrapper');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  selectCategory(value: string): void {
    this.task.category = value;
    this.categoryOpen = false;
  }
}
