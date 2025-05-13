import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { DialogConfig } from '../../models/dialog.model';
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';
import { User } from '../../models/user.class';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { SnackbarService } from '../../services/snackbar.service';

/**
 * A versatile dialog component for handling user account and contact management operations.
 * 
 * This component provides functionality for:
 * - Creating new contacts
 * - Editing existing contacts
 * - Managing user account settings
 * - Handling profile picture uploads and processing 
 * 
 * The dialog adapts its behavior and UI based on the provided configuration type:
 * - 'add': Creates a new contact
 * - 'edit': Modifies an existing contact
 * - 'account': Manages user account settings
 * 
 * @example
 * ```typescript
 * // Opening a dialog to create a new contact
 * this.dialog.open(ActionDialogComponent, {
 *   data: {
 *     type: 'add',
 *     title: 'New Contact',
 *     subtitle: 'Create a new contact'
 *   }
 * });
 * 
 * // Opening a dialog to edit an existing contact
 * this.dialog.open(ActionDialogComponent, {
 *   data: {
 *     type: 'edit',
 *     contact: existingContact,
 *     title: 'Edit Contact',
 *     subtitle: 'Edit contact details'
 *   }
 * });
 * ```
 */
@Component({
  selector: 'app-action-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatDialogModule],
  templateUrl: './action-dialog.component.html',
  styleUrl: './action-dialog.component.scss',
})
export class ActionDialogComponent implements OnInit {
  /** Controls the visibility state of the dialog for animation purposes */
  isVisible = false;

  /** Form data model for contact/account information */
  formData = {
    name: '',
    email: '',
    phone: '',
    initials: '',
    profilePicture: '',
    profileImage: null as File | null,
  };

  /** Temporary storage for profile image preview URL */
  profileImagePreview: string | null = null;

  /** Model for new contact data */
  newContact = {
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
  };

  /** Tracks validation errors for form fields */
  contactErrors = {
    name: false,
    email: false,
    phone: false,
  };

  /**
   * Creates an instance of ActionDialogComponent.
   * 
   * @param config - Configuration object for the dialog
   * @param dialogRef - Reference to the dialog instance
   * @param userService - Service for user management operations
   * @param dialogService - Service for dialog management
   * @param imageService - Service for image processing
   * @param router - Angular router for navigation
   * @param snackbarService - Service for displaying notifications
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public config: DialogConfig,
    public dialogRef: MatDialogRef<ActionDialogComponent>,
    private userService: UserService,
    private dialogService: DialogService,
    private imageService: ImageService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Initializes the dialog component.
   * Loads appropriate data based on dialog type and sets up visibility.
   */
  async ngOnInit() {
    await this.initializeDialog();
  }

  /**
   * Retrieves the dialog title from configuration.
   * 
   * @returns The configured dialog title
   */
  getDialogTitle(): string {
    return this.config.title;
  }

  /**
   * Retrieves the dialog subtitle from configuration.
   * 
   * @returns The configured dialog subtitle
   */
  getDialogSubtitle(): string {
    return this.config.subtitle;
  }

  /**
   * Gets the text for the primary button based on dialog type.
   * Returns 'Delete my account' for account type, 'Cancel' otherwise.
   * 
   * @returns The appropriate button text
   */
  getPrimaryButtonText(): string {
    if (this.config.type === 'account') {
      return 'Delete my account';
    }
    return 'Cancel';
  }

  /**
   * Gets the text for the secondary button based on dialog type.
   * 
   * @returns The appropriate button text based on dialog type
   */
  getSecondaryButtonText(): string {
    switch (this.config.type) {
      case 'add':
        return 'Create contact';
      case 'edit':
        return 'Save';
      case 'account':
        return 'Edit';
      default:
        return '';
    }
  }

  /**
   * Handles dialog close action with animation.
   * Sets visibility to false and closes dialog after animation.
   */
  async onClose(): Promise<void> {
    try {
      this.isVisible = false;
      setTimeout(() => this.dialogRef.close(false), 300);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handles file selection for profile picture.
   * Validates, compresses, and previews the selected image.
   * 
   * @param event - The file input change event
   */
  async onFileSelected(event: Event): Promise<void> {
    try {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      const file = input.files[0];
      const compressedImageData = await this.validateAndCompressImage(file);
      this.formData.profileImage = file;
      this.profileImagePreview = compressedImageData;
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handles form submission based on dialog type.
   * Routes to appropriate handler for contact creation or update.
   */
  async onSubmit(): Promise<void> {
    try {
      if (this.config.type === 'add') {
        await this.handleContactCreation();
      } else if (this.config.type === 'edit') {
        await this.handleContactUpdate();
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Opens the edit dialog for the current user.
   * Creates a new user object with current data and opens edit dialog.
   */
  async openEditDialog(): Promise<void> {
    try {
      const currentUser = await firstValueFrom(this.userService.currentUser$);
      if (!currentUser) return;

      const userForEdit = new User({
        uid: currentUser.uid,
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone,
        profilePicture: this.formData.profilePicture,
        iconColor: currentUser.iconColor,
      });

      this.dialogRef.close();
      this.dialogService.openDialog('edit', userForEdit);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handles account deletion with confirmation.
   * Shows confirmation dialog and processes deletion if confirmed.
   */
  async deleteAccount(): Promise<void> {
    try {
      const currentUser = await firstValueFrom(this.userService.currentUser$);
      if (!currentUser?.uid) return;

      const confirmed = await this.confirmAccountDeletion();
      if (!confirmed) return;

      await this.userService.deleteUser(currentUser.uid);
      this.dialogRef.close();
      await this.router.navigate(['/login']);
      this.snackbarService.success('Account successfully deleted');
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Processes new contact creation.
   * Validates form data and creates new user record.
   */
  private async handleContactCreation(): Promise<void> {
    try {
      if (!this.validateContactForm()) return;

      const cleanedPhone = this.cleanPhoneNumber(this.formData.phone);
      await this.userService.createUser({
        name: this.formData.name,
        email: this.formData.email,
        phone: cleanedPhone,
        profilePicture: this.profileImagePreview || '',
      });
      
      this.snackbarService.success('Contact successfully created');
      this.dialogRef.close(true);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Updates existing contact information.
   * Validates form data and updates user record.
   */
  private async handleContactUpdate(): Promise<void> {
    try {
      if (!this.config.contact?.uid || !this.validateContactForm()) return;

      await this.handleProfilePictureUpload(this.config.contact.uid);
      const cleanedPhone = this.cleanPhoneNumber(this.formData.phone);
      
      await this.userService.updateUser(this.config.contact.uid, {
        name: this.formData.name,
        email: this.formData.email,
        phone: cleanedPhone,
        profilePicture: this.profileImagePreview || this.formData.profilePicture || '',
      });

      const successMessage = await this.getUpdateSuccessMessage(this.config.contact.uid);
      this.snackbarService.success(successMessage);
      this.dialogRef.close(true);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Generates appropriate success message for update operation.
   * 
   * @param updatedUid - The ID of the updated user
   * @returns Success message indicating whether account or contact was updated
   */
  private async getUpdateSuccessMessage(updatedUid: string): Promise<string> {
    const currentUser = await firstValueFrom(this.userService.currentUser$);
    return updatedUid === currentUser?.uid
      ? 'Account successfully updated'
      : 'Contact successfully updated';
  }

  /**
   * Standardized error handling for the component.
   * Extracts error message and displays it via snackbar.
   * 
   * @param error - The error to handle
   */
  private async handleError(error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    this.snackbarService.error(message);
  }

  /**
   * Shows account deletion confirmation dialog.
   * 
   * @returns Promise resolving to user's confirmation choice
   */
  private async confirmAccountDeletion(): Promise<boolean> {
    return new Promise((resolve) => {
      this.snackbarService
        .confirm({
          message: 'Are you sure you want to delete your account? This cannot be undone.',
        })
        .subscribe((confirmed) => resolve(confirmed));
    });
  }

  /**
   * Loads current user data into form.
   * Subscribes to user service and updates form data.
   */
  private async loadUserData(): Promise<void> {
    try {
      this.userService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.formData = {
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              initials: user.initials,
              profilePicture: user.profilePicture || '',
              profileImage: null,
            };
          }
        },
        error: (error) => this.handleError(error)
      });
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Loads contact data into form for editing.
   * Updates form data with contact information.
   */
  private async loadContactData(): Promise<void> {
    try {
      if (this.config.contact) {
        this.formData = {
          name: this.config.contact.name,
          email: this.config.contact.email,
          phone: this.config.contact.phone || '',
          initials: this.config.contact.initials,
          profilePicture: this.config.contact.profilePicture || '',
          profileImage: null,
        };
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Initializes dialog with appropriate data.
   * Loads user or contact data based on dialog type.
   */
  private async initializeDialog(): Promise<void> {
    try {
      if (this.config.type === 'account') {
        await this.loadUserData();
      } else if (this.config.type === 'edit') {
        await this.loadContactData();
      }
      setTimeout(() => (this.isVisible = true), 50);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Validates email format.
   * 
   * @param email - The email to validate
   * @returns Whether the email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number format.
   * Allows optional + prefix and requires minimum 6 digits.
   * 
   * @param phone - The phone number to validate
   * @returns Whether the phone number is valid
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9\s]{6,}$/;
    return !phone || phoneRegex.test(phone);
  }

  /**
   * Validates name length.
   * 
   * @param name - The name to validate
   * @returns Whether the name is valid
   */
  private isValidName(name: string): boolean {
    return name.trim().length >= 2;
  }

  /**
   * Updates form validation state and shows error messages.
   * 
   * @returns Whether the form is valid
   */
  private updateFormErrors(): boolean {
    this.contactErrors = {
      name: !this.isValidName(this.formData.name),
      email: !this.isValidEmail(this.formData.email),
      phone: !this.isValidPhone(this.formData.phone),
    };

    if (this.contactErrors.name) {
      this.snackbarService.error('Name must be at least 2 characters');
      return false;
    }
    if (this.contactErrors.email) {
      this.snackbarService.error('Please enter a valid email address');
      return false;
    }
    if (this.contactErrors.phone) {
      this.snackbarService.error('Please enter a valid phone number');
      return false;
    }

    return true;
  }

  /**
   * Validates the entire contact form.
   * 
   * @returns Whether the form is valid
   */
  validateContactForm(): boolean {
    return this.updateFormErrors();
  }

  /**
   * Validates image file type.
   * 
   * @param file - The file to validate
   * @throws Error if file type is not allowed
   */
  private async validateImageFile(file: File): Promise<void> {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG and PNG files are allowed.');
    }
  }

  /**
   * Validates image size after compression.
   * 
   * @param base64Data - The compressed image data
   * @throws Error if image size exceeds limit
   */
  private async validateImageSize(base64Data: string): Promise<void> {
    const compressedSize = Math.round((base64Data.length * 3) / 4);
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (compressedSize > maxSize) {
      throw new Error('Image size exceeds 1MB limit after compression');
    }
  }

  /**
   * Validates and compresses an image file.
   * 
   * @param file - The image file to process
   * @returns Promise resolving to compressed image data
   */
  private async validateAndCompressImage(file: File): Promise<string> {
    await this.validateImageFile(file);
    const compressedImageData = await this.imageService.compressImage(file);
    await this.validateImageSize(compressedImageData);
    return compressedImageData;
  }

  /**
   * Removes whitespace from phone number.
   * 
   * @param phone - The phone number to clean
   * @returns Cleaned phone number
   */
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\s/g, '');
  }

  /**
   * Handles profile picture upload process.
   * 
   * @param uid - User ID for the profile picture
   */
  private async handleProfilePictureUpload(uid: string): Promise<void> {
    if (this.formData.profileImage) {
      try {
        await this.userService.updateUserProfilePicture(uid, this.formData.profileImage);
      } catch (error) {
        await this.handleError(error);
      }
    }
  }
}
