import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
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
    private dialogService: DialogService,
    private imageService: ImageService,
    private router: Router,
    private snackbarService: SnackbarService
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
    setTimeout(() => this.dialogRef.close(false), 300);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      this.snackbarService.error('Please upload a valid image file (JPG or PNG)');
      return;
    }

    try {
      // Erst komprimieren, dann Größe prüfen
      const compressedImageData = await this.imageService.compressImage(file);
      
      // Konvertiere Base64 string zur Größenberechnung
      const compressedSize = Math.round((compressedImageData.length * 3) / 4);
      const maxSize = 1 * 1024 * 1024; // 5MB
      
      if (compressedSize > maxSize) {
        this.snackbarService.error('Image is too large even after compression. Please try a smaller image.');
        return;
      }

      // Wenn alles okay ist, speichere das komprimierte Bild
      this.formData.profileImage = file;
      this.profileImagePreview = compressedImageData;
      
    } catch (error) {
      console.error('Error processing image:', error);
      this.snackbarService.error('Error processing image. Please try again.');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.formData.name || !this.formData.email) return;

    try {
      if (this.config.type === 'edit' && this.config.contact?.uid) {
        // Handle profile picture upload if a new one was selected
        if (this.formData.profileImage) {
          try {
            await this.userService.updateUserProfilePicture(this.config.contact.uid, this.formData.profileImage);
          } catch (error) {
            console.error('Error uploading profile picture:', error);
          }
        }

        // Update user data
        await this.userService.updateUser(this.config.contact.uid, {
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          profilePicture: this.profileImagePreview || this.formData.profilePicture || ''
        });

        // Close dialog and refresh data
        this.dialogRef.close(true);
        
      } else if (this.config.type === 'add') {
        // Create new user/contact
        const newUser = await this.userService.createUser({
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          profilePicture: this.profileImagePreview || ''
        });

        // Close dialog with true to indicate success
        this.dialogRef.close(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Optional: Show error message to user
    }
  }

  async openEditDialog(): Promise<void> {
    // Get current user from userService
    const currentUser = await firstValueFrom(this.userService.currentUser$);
    if (!currentUser) return;

    // Create user object with all necessary data including the uid
    const userForEdit = new User({
      uid: currentUser.uid,
      name: this.formData.name,
      email: this.formData.email,
      phone: this.formData.phone,
      profilePicture: this.formData.profilePicture,
      iconColor: currentUser.iconColor
    });

    this.dialogRef.close();
    this.dialogService.openDialog('edit', userForEdit);
  }

  async deleteAccount(): Promise<void> {
    const currentUser = await firstValueFrom(this.userService.currentUser$);
    const uid = currentUser?.uid;
    if (!uid) return;

    this.snackbarService.confirm({
      message: 'Are you sure you want to delete your account? This cannot be undone.'
    }).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.userService.deleteUser(uid);  // Now uid is definitely string
          this.dialogRef.close();
          await this.router.navigate(['/login']);
          this.snackbarService.success('Account successfully deleted');
        } catch (error) {
          console.error('Error deleting account:', error);
          this.snackbarService.error('Could not delete account');
        }
      }
    });
  }
}
