import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DialogConfig } from '../../models/dialog.model';
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-action-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatDialogModule],
  templateUrl: './action-dialog.component.html',
  styleUrl: './action-dialog.component.scss'
})
export class ActionDialogComponent implements OnInit {
  isVisible = false;
  formData = {
    name: '',
    email: '',
    phone: '',
    initials: '',
    profilePicture: '',
    profileImage: null as File | null
  };
  profileImagePreview: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public config: DialogConfig,
    public dialogRef: MatDialogRef<ActionDialogComponent>,
    private userService: UserService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    if (this.config.type === 'account') {
      // Laden der User-Daten, wenn es sich um My Account handelt
      this.userService.currentUser$.subscribe(user => {
        if (user) {
          this.formData = {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            initials: user.initials,
            profilePicture: user.profilePicture || '',
            profileImage: null
          };
        }
      });
    } else if (this.config.type === 'edit' && this.config.contact) {
      this.formData = {
        name: this.config.contact.name,
        email: this.config.contact.email,
        phone: this.config.contact.phone || '',
        initials: this.config.contact.initials,
        profilePicture: this.config.contact.profilePicture || '',
        profileImage: null
      };
    }
    setTimeout(() => this.isVisible = true, 50);
  }

  getDialogTitle(): string {
    return this.config.title;
  }

  getDialogSubtitle(): string {
    return this.config.subtitle;
  }

  onClose(): void {
    this.isVisible = false;
    setTimeout(() => this.dialogRef.close(), 300);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG or PNG)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image must be smaller than 5MB');
      return;
    }

    try {
      // We'll store the original file for later upload
      this.formData.profileImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.formData.name || !this.formData.email) {
      return;
    }

    try {
      if (this.config.type === 'add') {
        // Create new user/contact
        const newUser = await this.userService.createUser({
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          profilePicture: this.profileImagePreview || ''
        });

        // Close dialog and refresh contacts list
        this.onClose();
        // Optional: Show success message
        console.log('Contact created successfully:', newUser);
      } else if (this.config.type === 'edit') {
        // Existing edit logic...
        if (this.formData.profileImage) {
          try {
            const userId = this.config.contact?.uid;
            if (userId) {
              await this.userService.updateUserProfilePicture(userId, this.formData.profileImage);
            }
          } catch (error) {
            console.error('Error uploading profile picture:', error);
          }
        }
        this.dialogRef.close(this.formData);
      } else if (this.config.type === 'account') {
        this.dialogRef.close();
        const currentUser = new User({
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          initials: this.formData.initials,
          profilePicture: this.formData.profilePicture
        });
        this.dialogService.openDialog('edit', currentUser);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Optional: Show error message to user
    }
  }
}
