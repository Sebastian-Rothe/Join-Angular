import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionDialogComponent } from '../components/action-dialog/action-dialog.component';
import { DialogConfig } from '../models/dialog.model';
import { User } from '../models/user.class';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog, private auth: AuthService) {}

  async openDialog(type: 'account' | 'edit' | 'add', contact?: User): Promise<MatDialogRef<ActionDialogComponent>> {
    const currentUser = await firstValueFrom(this.auth.user$);
    const isCurrentUser = currentUser?.uid === contact?.uid;
    
    const config: DialogConfig = {
      type,
      title: this.getDialogTitle(type, isCurrentUser),
      subtitle: this.getDialogSubtitle(type),
      contact,
      isCurrentUser
    };
    
    return this.dialog.open(ActionDialogComponent, {
      width: '90%',
      maxWidth: '1000px',
      data: config,
      disableClose: true,
      hasBackdrop: true
    });
  }

  private getDialogTitle(type: 'account' | 'edit' | 'add', isCurrentUser: boolean): string {
    switch (type) {
      case 'account':
        return 'My Account';
      case 'edit':
        return isCurrentUser ? 'Edit Account' : 'Edit Contact';
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
