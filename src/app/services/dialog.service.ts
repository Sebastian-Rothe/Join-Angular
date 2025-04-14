import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionDialogComponent } from '../components/action-dialog/action-dialog.component';
import { DialogConfig } from '../models/dialog.model';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(type: 'account' | 'edit' | 'add', contact?: User): MatDialogRef<ActionDialogComponent> {
    const config: DialogConfig = {
      type,
      title: this.getDialogTitle(type),
      subtitle: this.getDialogSubtitle(type),
      contact
    };
    
    return this.dialog.open(ActionDialogComponent, {
      width: '90%',
      maxWidth: '1000px',
      data: config,
      disableClose: true,
      hasBackdrop: true
    });
  }

  private getDialogTitle(type: 'account' | 'edit' | 'add'): string {
    switch (type) {
      case 'account':
        return 'My Account';
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
        return '';
      case 'edit':
        return '';
      case 'add':
        return 'Tasks are better with a Team!';
      default:
        return '';
    }
  }
}
