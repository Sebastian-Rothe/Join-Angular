import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionDialogComponent } from '../components/action-dialog/action-dialog.component';
import { DialogConfig } from '../models/dialog.model';
import { User } from '../models/user.class';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

/**
 * Service for managing Material Dialog interactions throughout the application
 * 
 * @class DialogService
 * @description Handles the creation and configuration of different types of dialogs
 * including account management, contact editing, and contact creation dialogs
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog, private auth: AuthService) {}

  /**
   * Opens a dialog based on the specified type and configuration
   * 
   * @param {('account' | 'edit' | 'add')} type - The type of dialog to open
   * @param {User} [contact] - Optional contact data for edit operations
   * @returns {Promise<MatDialogRef<ActionDialogComponent>>} Reference to the opened dialog
   */
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

  /**
   * Determines the appropriate dialog title based on type and user context
   * 
   * @private
   * @param {('account' | 'edit' | 'add')} type - The type of dialog
   * @param {boolean} isCurrentUser - Whether the dialog is for the current user
   * @returns {string} The formatted dialog title
   */
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

  /**
   * Gets the subtitle text for the dialog based on its type
   * 
   * @private
   * @param {('account' | 'edit' | 'add')} type - The type of dialog
   * @returns {string} The appropriate subtitle text
   */
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
