import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DialogConfig } from '../../models/dialog.model';

@Component({
  selector: 'app-action-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatDialogModule],
  templateUrl: './action-dialog.component.html',
  styleUrl: './action-dialog.component.scss'
})
export class ActionDialogComponent {
  isVisible = false;
  formData = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: DialogConfig
  ) {
    // Initialize form data if editing
    if (config.contact) {
      this.formData = {
        name: config.contact.name,
        email: config.contact.email,
        phone: config.contact.phone
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

  onSubmit(): void {
    this.dialogRef.close(this.formData);
  }
}
