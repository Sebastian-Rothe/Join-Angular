import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionDialogComponent } from '../components/action-dialog/action-dialog.component';
import { DialogConfig } from '../models/dialog.model';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(type: 'account' | 'edit' | 'add', contact?: User): void {
    const config: DialogConfig = {
      type,
      title: this.getDialogTitle(type),
      subtitle: this.getDialogSubtitle(type),
      contact
    };
    
    this.dialog.open(ActionDialogComponent, {
      width: '90%',
      maxWidth: '1000px',
      data: config
    });
  }

  private getDialogTitle(type: 'account' | 'edit' | 'add'): string {
    switch (type) {
      case 'account':
        return 'Account Details';
      case 'edit':
        return 'Edit Contact';
      case 'add':
        return 'Add Contact';
      default:
        return '';
    }
  }

  private getDialogSubtitle(type: 'account' | 'edit' | 'add'): string {
    switch (type) {
      case 'account':
        return 'View account details';
      case 'edit':
        return 'Edit contact information';
      case 'add':
        return 'Add a new contact';
      default:
        return '';
    }
  }
}
