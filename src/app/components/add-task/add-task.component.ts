import { Component, OnInit, HostListener, LOCALE_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import localeDe from '@angular/common/locales/de';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, Subtask, TaskFile } from '../../models/task.class';
import { User } from '../../models/user.class';
import { CustomDateAdapter } from '../../adapters/custom-date.adapter';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: LOCALE_ID, useValue: 'de-DE' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit {
  @ViewChild('fileGrid') fileGrid!: ElementRef;
  minDate: Date = new Date(); 

  private isDraggingGrid = false;
  private startX = 0;
  private scrollLeft = 0;

  private filePreviews = new Map<File, string>();

  categories = [
    { value: 'TechnicalTask', label: 'Technical Task' },
    { value: 'UserStory', label: 'User Story' }
  ];
  categoryOpen: boolean = false;
  
  task: Task = new Task();

  contacts: User[] = [];
  selectedContacts: User[] = [];
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

  currentUser: User | null = null;

  isDragging = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private taskService: TaskService
  ) {
    registerLocaleData(localeDe);
  }

  ngOnInit(): void {
    this.setupCurrentUser();  // Load current user first
    this.loadContacts();
  }

  private setupCurrentUser(): void {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        const userDoc = await this.userService.getUserById(user.uid);
        if (userDoc) {
          this.currentUser = userDoc;
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
      this.contacts = await this.userService.getAllUsers();
      if (this.currentUser) {
        this.sortContacts(); // Sort if current user is already loaded
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('Failed to load users');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Handle contacts dropdown
    const contactsDropdown = document.querySelector('.dropdown');
    if (this.dropdownOpen && !contactsDropdown?.contains(event.target as Node)) {
      this.dropdownOpen = false;
    }

    // Handle category dropdown
    const categoryDropdown = document.querySelector('.dropdown-category');
    if (this.categoryOpen && !categoryDropdown?.contains(event.target as Node)) {
      this.categoryOpen = false;
    }
  }

  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleCategory(event: MouseEvent): void {
    event.stopPropagation();
    this.categoryOpen = !this.categoryOpen;
    if (this.categoryOpen) {
      setTimeout(() => {
        const element = document.querySelector('.category-wrapper');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  isContactSelected(contact: User): boolean {
    return this.selectedContacts.some(c => c.uid === contact.uid);
  }

  toggleContact(contact: User): void {
    const index = this.selectedContacts.findIndex(c => c.uid === contact.uid);
    
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
    
    this.task.assignedTo = [...this.selectedContacts];
  }

  removeContact(contact: User): void {
    const index = this.selectedContacts.findIndex(c => c.uid === contact.uid);
    if (index !== -1) {
      this.selectedContacts.splice(index, 1);
      this.task.assignedTo = [...this.selectedContacts];
    }
  }

  private async fileToTaskFile(file: File): Promise<TaskFile> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          data: e.target?.result as string,
          name: file.name,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    });
  }

  async onFileSelected(event: Event): Promise<void> {
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
      
      const taskFiles = await Promise.all(files.map(file => this.fileToTaskFile(file)));
      this.task.files = [...this.task.files, ...taskFiles];
    }
  }

  getFilePreview(file: TaskFile): string {
    return file.data;
  }

  removeFile(index: number): void {
    this.task.files.splice(index, 1);
  }

  removeAllFiles(): void {
    this.task.files = [];
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

  async createTask(): Promise<void> {
    if (this.validateForm()) {
      try {
        await this.taskService.createTask(this.task);
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.clearForm();
        }, 2000);
      } catch (error) {
        console.error('Error creating task:', error);
        this.showError('Failed to create task');
      }
    }
  }

  clearForm(): void {
    this.task = new Task();
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

  selectCategory(value: string): void {
    this.task.category = value;
    this.categoryOpen = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const validFiles = Array.from(files).filter(file => allowedTypes.includes(file.type));
      
      if (validFiles.length > 0) {
        const taskFiles = await Promise.all(validFiles.map(file => this.fileToTaskFile(file)));
        this.task.files = [...this.task.files, ...taskFiles];
      } else {
        this.showError('Please upload only JPG or PNG files');
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (this.fileGrid) {
      this.fileGrid.nativeElement.scrollLeft += event.deltaY;
    }
  }

  startDragging(event: MouseEvent): void {
    this.isDraggingGrid = true;
    this.startX = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    this.scrollLeft = this.fileGrid.nativeElement.scrollLeft;
    this.fileGrid.nativeElement.style.cursor = 'grabbing';
  }

  stopDragging(): void {
    this.isDraggingGrid = false;
    this.fileGrid.nativeElement.style.cursor = 'grab';
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDraggingGrid) return;
    event.preventDefault();
    const x = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.fileGrid.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  ngOnDestroy(): void {
    this.filePreviews.forEach((url) => URL.revokeObjectURL(url));
    this.filePreviews.clear();
  }
}
