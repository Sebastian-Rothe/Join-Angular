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

@Component({
  selector: 'app-action-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatDialogModule],
  templateUrl: './action-dialog.component.html',
  styleUrl: './action-dialog.component.scss',
})
export class ActionDialogComponent implements OnInit {
  isVisible = false;
  formData = {
    name: '',
    email: '',
    phone: '',
    initials: '',
    profilePicture: '',
    profileImage: null as File | null,
  };
  profileImagePreview: string | null = null;

  newContact = {
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
  };

  contactErrors = {
    name: false,
    email: false,
    phone: false,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public config: DialogConfig,
    public dialogRef: MatDialogRef<ActionDialogComponent>,
    private userService: UserService,
    private dialogService: DialogService,
    private imageService: ImageService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  async ngOnInit() {
    await this.initializeDialog();
  }

  getDialogTitle(): string {
    return this.config.title;
  }

  getDialogSubtitle(): string {
    return this.config.subtitle;
  }

  getPrimaryButtonText(): string {
    if (this.config.type === 'account') {
      return 'Delete my account';
    }
    return 'Cancel';
  }

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

  async onClose(): Promise<void> {
    try {
      this.isVisible = false;
      setTimeout(() => this.dialogRef.close(false), 300);
    } catch (error) {
      await this.handleError(error);
    }
  }

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

  private async getUpdateSuccessMessage(updatedUid: string): Promise<string> {
    const currentUser = await firstValueFrom(this.userService.currentUser$);
    return updatedUid === currentUser?.uid
      ? 'Account successfully updated'
      : 'Contact successfully updated';
  }

  private async handleError(error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    this.snackbarService.error(message);
  }

  private async confirmAccountDeletion(): Promise<boolean> {
    return new Promise((resolve) => {
      this.snackbarService
        .confirm({
          message: 'Are you sure you want to delete your account? This cannot be undone.',
        })
        .subscribe((confirmed) => resolve(confirmed));
    });
  }

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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9\s]{6,}$/; // Erlaubt optionales + am Anfang, mind. 6 Ziffern
    return !phone || phoneRegex.test(phone); // Phone ist optional
  }

  private isValidName(name: string): boolean {
    return name.trim().length >= 2;
  }

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

  validateContactForm(): boolean {
    return this.updateFormErrors();
  }

  private async validateImageFile(file: File): Promise<void> {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG and PNG files are allowed.');
    }
  }

  private async validateImageSize(base64Data: string): Promise<void> {
    const compressedSize = Math.round((base64Data.length * 3) / 4);
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (compressedSize > maxSize) {
      throw new Error('Image size exceeds 1MB limit after compression');
    }
  }

  private async validateAndCompressImage(file: File): Promise<string> {
    await this.validateImageFile(file);
    const compressedImageData = await this.imageService.compressImage(file);
    await this.validateImageSize(compressedImageData);
    return compressedImageData;
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\s/g, ''); // Entfernt nur Leerzeichen
  }

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
