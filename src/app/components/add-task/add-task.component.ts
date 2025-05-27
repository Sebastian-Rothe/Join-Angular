/**
 * Component for creating and editing tasks in the Join application.
 * 
 * This component provides a comprehensive interface for:
 * - Creating new tasks
 * - Editing existing tasks
 * - Managing task assignments
 * - Handling file attachments
 * - Setting task priorities and categories
 * 
 * Features:
 * - Drag and drop file upload
 * - Contact selection and management
 * - Due date selection with validation
 * - Subtask management
 * - Category and priority selection
 * 
 * The component can be used both as a standalone page and as a dialog.
 * 
 * @example
 * ```typescript
 * // Opening as a dialog for creating a new task
 * this.dialog.open(AddTaskComponent, {
 *   data: { initialStatus: 'todo' }
 * });
 * 
 * // Opening as a dialog for editing an existing task
 * this.dialog.open(AddTaskComponent, {
 *   data: { 
 *     isEditMode: true,
 *     taskToEdit: existingTask
 *   }
 * });
 * ```
 */
import { Component, OnInit, HostListener, LOCALE_ID, ViewChild, ElementRef, Optional, Inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import localeDe from '@angular/common/locales/de';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ImageService } from '../../services/image.service';
import { SnackbarService } from '../../services/snackbar.service';
import { HeaderService } from '../../services/header.service';
import { Task, Subtask, TaskFile } from '../../models/task.class';
import { User } from '../../models/user.class';
import { CustomDateAdapter } from '../../shared/adapters/custom-date.adapter';
import { ImageViewerComponent } from '../../shared/components/image-viewer/image-viewer.component';

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
    MatNativeDateModule,
    ImageViewerComponent
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
  /** Reference to the file grid element for horizontal scrolling */
  @ViewChild('fileGrid') fileGrid!: ElementRef;
  
  /** Minimum allowed date for task due date */
  minDate: Date;

  /** Flag for tracking file grid dragging state */
  private isDraggingGrid = false;
  
  /** Starting X coordinate for drag operation */
  private startX = 0;
  
  /** Initial scroll position for drag operation */
  private scrollLeft = 0;

  /** Map to store file preview URLs */
  private filePreviews = new Map<File, string>();

  /** Available task categories */
  categories = [
    { value: 'TechnicalTask', label: 'Technical Task' },
    { value: 'UserStory', label: 'User Story' }
  ];

  /** Flag for category dropdown state */
  categoryOpen: boolean = false;
  
  /** The task being created or edited */
  task: Task = new Task();

  /** List of all available contacts */
  contacts: User[] = [];
  
  /** Currently selected contacts for task assignment */
  selectedContacts: User[] = [];
  
  /** Flag for contacts dropdown state */
  dropdownOpen = false;
  
  /** Current subtask input value */
  newSubtask = '';
  
  /** Flag for subtask input active state */
  isSubtaskInputActive = false;
  
  /** Form validation error states */
  errors = {
    title: false,
    dueDate: false,
    category: false
  };

  /** Currently logged in user */
  currentUser: User | null = null;

  /** Flag for file drag state */
  isDragging = false;

  /** Flag indicating whether component is used in dialog */
  isDialog = false;
  
  /** Flag indicating edit mode */
  isEditMode = false;

  /** Selected date for datepicker */
  dateValue: Date | null = null;

  /** Array of image information for viewer */
  images: { url: string, name: string, size: number }[] = [];
  
  /** Current image index in viewer */
  currentIndex: number = 0;
  
  /** Flag for image viewer visibility */
  showImageViewer: boolean = false;

  /**
   * Creates an instance of AddTaskComponent.
   * 
   * @param userService - Service for user management
   * @param authService - Service for authentication
   * @param taskService - Service for task operations
   * @param imageService - Service for image processing
   * @param snackbarService - Service for notifications
   * @param headerService - Service for header management
   * @param router - Angular router service
   * @param dialogRef - Optional reference if used as dialog
   * @param dialogData - Optional configuration data
   */
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private taskService: TaskService,
    private imageService: ImageService,
    private snackbarService: SnackbarService,
    public headerService: HeaderService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<AddTaskComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData?: {
      initialStatus?: string,
      isEditMode?: boolean,
      taskToEdit?: Task
    }
  ) {
    registerLocaleData(localeDe);
    this.isDialog = !!dialogRef;
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);
    
    if (dialogData?.isEditMode && dialogData?.taskToEdit) {
      this.initializeEditMode(dialogData.taskToEdit);
    } else {
      this.initializeCreateMode(dialogData?.initialStatus);
    }
  }

  /**
   * Initializes the component in edit mode
   * 
   * @param taskToEdit - The task to be edited
   */
  private initializeEditMode(taskToEdit: Task): void {
    this.isEditMode = true;
    this.task = new Task(taskToEdit);
    this.selectedContacts = [...this.task.assignedTo];
    this.dateValue = this.task.dueDate ? new Date(this.task.dueDate) : null;
  }

  /**
   * Initializes the component in create mode
   * 
   * @param initialStatus - Optional initial status for the new task
   */
  private initializeCreateMode(initialStatus?: string): void {
    this.task.status = initialStatus || 'todo';
  }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   * Loads the current user and available contacts when component initializes.
   */
  ngOnInit(): void {
    this.loadUserAndContacts();
  }

  /**
   * Loads the current user and all available contacts.
   */
  private async loadUserAndContacts(): Promise<void> {
    await this.setupCurrentUser();
    await this.loadContacts();
  }

  /**
   * Sets up the current user and initializes task assignment.
   */
  private async setupCurrentUser(): Promise<void> {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        const userDoc = await this.userService.getUserById(user.uid);
        if (userDoc) {
          this.currentUser = userDoc;
          if (!this.isEditMode) {
            this.selectedContacts = [this.currentUser];
            this.task.assignedTo = [this.currentUser];
          }
          this.sortContacts();
        }
      }
    });
  }

  /**
   * Loads all available contacts from the user service.
   */
  private async loadContacts(): Promise<void> {
    try {
      this.contacts = await this.userService.getAllUsers();
      if (this.currentUser) {
        this.sortContacts();
      }
    } catch (error) {
      this.snackbarService.error('Failed to load users');
    }
  }

  /**
   * Sorts the contacts list, prioritizing the current user.
   */
  private sortContacts(): void {
    this.contacts.sort((a, b) => {
      if (a.uid === this.currentUser?.uid) return -1;
      if (b.uid === this.currentUser?.uid) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Updates the assigned contacts for the task.
   */
  private updateAssignedContacts(): void {
    this.task.assignedTo = [...this.selectedContacts];
  }

  @HostListener('document:click', ['$event'])
  private handleOutsideClick(event: MouseEvent): void {
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

  /**
   * Toggles the contacts dropdown menu.
   * Prevents event propagation if event is provided.
   * 
   * @param event - Optional mouse event
   */  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownOpen = !this.dropdownOpen;
    
    if (this.dropdownOpen) {
      setTimeout(() => {
        const element = document.querySelector('.dropdown');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  /**
   * Toggles the category dropdown menu and scrolls it into view.
   * 
   * @param event - Mouse event to prevent propagation
   */
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

  /**
   * Checks if a contact is currently selected.
   * 
   * @param contact - The contact to check
   * @returns True if contact is selected, false otherwise
   */
  isContactSelected(contact: User): boolean {
    return this.selectedContacts.some(c => c.uid === contact.uid);
  }

  /**
   * Toggles the selection state of a contact for task assignment.
   * If the contact is already selected, removes them from selection.
   * If not selected, adds them to selection.
   * 
   * @param contact - The contact to toggle selection for
   */
  toggleContact(contact: User): void {
    const index = this.selectedContacts.findIndex(c => c.uid === contact.uid);
    
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
    
    this.updateAssignedContacts();
  }

  /**
   * Removes a contact from the selected contacts list.
   * Updates the task's assigned contacts after removal.
   * 
   * @param contact - The contact to remove from selection
   */
  removeContact(contact: User): void {
    const index = this.selectedContacts.findIndex(c => c.uid === contact.uid);
    if (index !== -1) {
      this.selectedContacts.splice(index, 1);
      this.updateAssignedContacts();
    }
  }

  /**
   * Processes multiple files for task attachment.
   * Validates file types and converts them to TaskFile format.
   * 
   * @param files - Array of files to process
   * @returns Promise resolving to array of TaskFile objects
   * @throws Error if file type is not allowed
   */
  private async processFiles(files: File[]): Promise<TaskFile[]> {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const validFiles = [];

    for (const file of files) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(extension)) {
        throw new Error(`File "${file.name}" has invalid type. Only jpg, jpeg, png, and pdf files are allowed.`);
      }
      validFiles.push(file);
    }

    return Promise.all(validFiles.map(file => this.fileToTaskFile(file)));
  }

  /**
   * Handles the file upload process for both drag-and-drop and file input.
   * Processes the files and adds them to the task's file list.
   * Shows error message if file processing fails.
   * 
   * @param files - Array of files to upload
   */
  private async handleFileUpload(files: File[]): Promise<void> {
    try {
      const taskFiles = await this.processFiles(files);
      this.task.files = [...this.task.files, ...taskFiles];
    } catch (error) {
      this.snackbarService.error({
        message: 'This file format is not allowed!',
        secondLine: 'You can only upload JPEG and PNG.'
      });
    }
  }

  /**
   * Handles file selection from file input element.
   * Processes selected files if any are chosen.
   * 
   * @param event - The file input change event
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      await this.handleFileUpload(Array.from(input.files));
    }
  }

  /**
   * Handles file drop event for drag-and-drop file upload.
   * Prevents default browser behavior and processes dropped files.
   * 
   * @param event - The drop event containing files
   */
  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      await this.handleFileUpload(Array.from(files));
    }
  }

  /**
   * Converts a File object to TaskFile format.
   * Compresses images before conversion.
   * 
   * @param file - The file to convert
   * @returns Promise resolving to TaskFile object
   * @throws Error if file processing fails
   */
  private async fileToTaskFile(file: File): Promise<TaskFile> {
    try {
      const compressedImageData = await this.imageService.compressImage(file);
      return {
        data: compressedImageData,
        name: file.name,
        type: file.type
      };
    } catch (error) {
      throw new Error(`Failed to process file "${file.name}"`);
    }
  }

  /**
   * Gets the preview URL for a task file.
   * 
   * @param file - The task file to get preview for
   * @returns The data URL for the file preview
   */
  getFilePreview(file: TaskFile): string {
    return file.data;
  }

  /**
   * Removes a file from the task's file list.
   * 
   * @param index - Index of the file to remove
   */
  removeFile(index: number): void {
    this.task.files.splice(index, 1);
  }

  /**
   * Removes all files from the task.
   */
  removeAllFiles(): void {
    this.task.files = [];
  }

  /**
   * Sets the priority level for the task.
   * 
   * @param priority - The priority level to set
   */
  selectPriority(priority: 'urgent' | 'medium' | 'low'): void {
    this.task.priority = priority;
  }

  /**
   * Updates subtask input active state based on input value.
   */
  subTaskInput(): void {
    this.isSubtaskInputActive = this.newSubtask.trim().length > 0;
  }

  /**
   * Activates the subtask input field.
   */
  activateSubtaskInput(): void {
    this.isSubtaskInputActive = true;
  }

  /**
   * Clears the subtask input field and resets its state.
   */
  clearSubtaskInput(): void {
    this.newSubtask = '';
    this.isSubtaskInputActive = false;
  }

  /**
   * Adds a new subtask to the task if input is not empty.
   */
  addSubtask(): void {
    if (this.newSubtask.trim()) {
      this.task.subtasks.push({
        title: this.newSubtask.trim(),
        completed: false
      });
      this.clearSubtaskInput();
    }
  }

  /**
   * Moves a subtask back to the input field for editing.
   * 
   * @param index - Index of the subtask to edit
   */
  editSubtask(index: number): void {
    this.newSubtask = this.task.subtasks[index].title;
    this.isSubtaskInputActive = true;
    this.deleteSubtask(index);
  }

  /**
   * Deletes a subtask from the list.
   * 
   * @param index - Index of the subtask to delete
   */
  deleteSubtask(index: number): void {
    this.task.subtasks.splice(index, 1);
  }

  /**
   * Validates the task title.
   * Title must not be empty after trimming whitespace.
   * 
   * @returns True if title is valid, false otherwise
   */
  private validateTitle(): boolean {
    const isValid = Boolean(this.task.title.trim());
    this.errors.title = !isValid;
    return isValid;
  }

  /**
   * Validates the task due date.
   * Due date must be set and greater than 0.
   * 
   * @returns True if due date is valid, false otherwise
   */
  private validateDueDate(): boolean {
    const isValid = this.task.dueDate > 0;
    this.errors.dueDate = !isValid;
    return isValid;
  }

  /**
   * Validates the task category.
   * Category must be selected.
   * 
   * @returns True if category is valid, false otherwise
   */
  private validateCategory(): boolean {
    const isValid = Boolean(this.task.category);
    this.errors.category = !isValid;
    return isValid;
  }

  /**
   * Validates the entire task form.
   * Checks title, due date, and category.
   * Updates error states for invalid fields.
   * 
   * @returns True if all validations pass, false otherwise
   */
  validateForm(): boolean {
    const isTitleValid = this.validateTitle();
    const isDueDateValid = this.validateDueDate();
    const isCategoryValid = this.validateCategory();
    
    return isTitleValid && isDueDateValid && isCategoryValid;
  }

  /**
   * Handles the creation of a new task.
   * Creates the task in the database, shows success message,
   * closes dialog if in dialog mode or navigates to board,
   * and clears the form.
   * 
   * @throws {Error} If task creation fails
   */
  private async handleTaskCreation(): Promise<void> {
    await this.taskService.createTask(this.task);
    this.snackbarService.success('Task added to board', true);
    
    if (this.dialogRef) {
      this.dialogRef.close('taskAdded');
    } else {
      await this.router.navigate(['/main/board']);
    }
    this.clearForm();
  }

  /**
   * Updates an existing task in the database.
   * Shows a success message upon completion and closes the dialog if in dialog mode.
   * 
   * @throws {Error} If task update fails
   */
  private async handleTaskUpdate(): Promise<void> {
    await this.taskService.updateTask(this.task);
    // this.snackbarService.success('Task successfully updated', false);
    
    if (this.dialogRef) {
      await this.closeDialog();
    }
  }

  /**
   * Creates a new task or updates an existing one based on edit mode.
   * Validates the form before proceeding.
   * Shows appropriate success/error messages.
   * In dialog mode, closes dialog after successful operation.
   * In standalone mode, navigates to board after task creation.
   */
  async createTask(): Promise<void> {
    if (!this.validateForm()) return;

    try {
      if (this.isEditMode) {
        await this.handleTaskUpdate();
      } else {
        await this.handleTaskCreation();
      }
    } catch (error) {
      this.snackbarService.error(this.isEditMode ? 'Failed to update task' : 'Failed to create task');
    }
  }

  /**
   * Clears all form data and resets to initial state.
   */
  clearForm(): void {
    this.task = new Task();
    this.selectedContacts = [];
    this.clearSubtaskInput();
    this.dateValue = null;  
  }

  /**
   * Sets the category for the task and closes the dropdown.
   * 
   * @param value - The category value to set
   */
  selectCategory(value: string): void {
    this.task.category = value;
    this.categoryOpen = false;
  }

  /**
   * Handles dragover event for file upload zone.
   * 
   * @param event - The dragover event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  /**
   * Handles dragleave event for file upload zone.
   * 
   * @param event - The dragleave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  /**
   * Handles mouse wheel event for horizontal scrolling in file grid.
   * 
   * @param event - The wheel event
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (this.fileGrid) {
      this.fileGrid.nativeElement.scrollLeft += event.deltaY;
    }
  }

  /**
   * Handles the file grid drag movement.
   * Updates scroll position based on drag distance.
   * 
   * @param event - Mouse event containing current coordinates
   */
  private handleFileGridDrag(event: MouseEvent): void {
    if (!this.isDraggingGrid) return;
    
    event.preventDefault();
    const x = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.fileGrid.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  /**
   * Initializes the file grid drag operation.
   * Sets up initial coordinates and cursor style.
   * 
   * @param event - Mouse event containing start coordinates
   */
  private initializeFileGridDrag(event: MouseEvent): void {
    this.isDraggingGrid = true;
    this.startX = event.pageX - this.fileGrid.nativeElement.offsetLeft;
    this.scrollLeft = this.fileGrid.nativeElement.scrollLeft;
    this.fileGrid.nativeElement.style.cursor = 'grabbing';
  }

  /**
   * Resets the file grid drag state.
   * Restores default cursor style.
   */
  private resetFileGridDrag(): void {
    this.isDraggingGrid = false;
    this.fileGrid.nativeElement.style.cursor = 'grab';
  }

  /**
   * Starts the dragging operation for file grid.
   * 
   * @param event - Mouse event that triggered the drag
   */
  startDragging(event: MouseEvent): void {
    this.initializeFileGridDrag(event);
  }

  /**
   * Stops the dragging operation for file grid.
   */
  stopDragging(): void {
    this.resetFileGridDrag();
  }

  /**
   * Handles ongoing drag operation for file grid.
   * 
   * @param event - Mouse event containing current coordinates
   */
  onDrag(event: MouseEvent): void {
    this.handleFileGridDrag(event);
  }

  /**
   * Closes the dialog with a sliding animation.
   * Waits for animation to complete before closing.
   */
  private async closeDialogWithAnimation(): Promise<void> {
    const dialogContainer = document.querySelector('.add-task-dialog .mdc-dialog__surface');
    if (dialogContainer) {
      dialogContainer.classList.remove('slide-in');
      dialogContainer.classList.add('slide-out');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    this.dialogRef?.close();
  }

  /**
   * Closes the dialog if component is used in dialog mode.
   * Uses animation for smooth transition.
   */
  async closeDialog(): Promise<void> {
    if (this.dialogRef) {
      await this.closeDialogWithAnimation();
    }
  }

  /**
   * Handles date selection from the datepicker.
   * Validates that the selected date is in the future.
   * 
   * @param event - The date selection event
   */
  onDateSelected(event: any): void {
    const selectedDate = event.value;
    
    if (selectedDate) {
      const dateToCheck = new Date(selectedDate);
      dateToCheck.setHours(0, 0, 0, 0);
      
      if (dateToCheck < this.minDate) {
        this.dateValue = null;
        this.task.dueDate = 0;
        this.errors.dueDate = true;
        this.snackbarService.error('Please select a date in the future');
      } else {
        this.dateValue = selectedDate;
        this.task.dueDate = selectedDate.getTime();
        this.errors.dueDate = false;
      }
    }
  }

  /**
   * Opens the image viewer for a specific file.
   * 
   * @param index - Index of the file to view
   */
  openImageViewer(index: number): void {
    if (this.task.files[index]?.data) {
      this.headerService.setHeaderZIndex('0');
      this.images = this.task.files.map(file => ({
        url: file.data,
        name: file.name,
        size: this.getBase64Size(file.data)
      }));
      this.currentIndex = index;
      this.showImageViewer = true;
    }
  }

  /**
   * Closes the image viewer and resets header z-index.
   */
  closeImageViewer(): void {
    this.showImageViewer = false;
    this.headerService.resetHeaderZIndex();
  }

  /**
   * Handles cleanup of file preview URLs on component destruction.
   */
  ngOnDestroy(): void {
    this.filePreviews.forEach((url) => URL.revokeObjectURL(url));
    this.filePreviews.clear();
  }

  /**
   * Calculates the size of a base64 encoded string in bytes.
   * 
   * @param base64String - The base64 string to calculate size for
   * @returns The size in bytes
   */
  private getBase64Size(base64String: string): number {
    const padding = (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
    const size = (base64String.length * 3) / 4 - padding;
    return size;
  }
}
