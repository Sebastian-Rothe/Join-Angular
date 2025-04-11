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
    initials: ''
  };

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
            initials: user.initials
          };
        }
      });
    } else if (this.config.type === 'edit' && this.config.contact) {
      this.formData = {
        name: this.config.contact.name,
        email: this.config.contact.email,
        phone: this.config.contact.phone || '',
        initials: this.config.contact.initials
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
    if (this.config.type === 'account') {
      this.dialogRef.close();
      const currentUser = new User({
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone,
        initials: this.formData.initials
      });
      this.dialogService.openDialog('edit', currentUser);
    } else {
      this.dialogRef.close(this.formData);
    }
  }
}
