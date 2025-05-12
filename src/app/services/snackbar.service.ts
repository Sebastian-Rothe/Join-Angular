import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from '../shared/components/message-dialog/message-dialog.component';

/**
 * Interface for confirm dialog configuration
 * @interface ConfirmDialogData
 */
interface ConfirmDialogData {
  message: string;
}

/**
 * Interface for message dialog configuration
 * @interface MessageData
 */
interface MessageData {
  message: string;
  secondLine?: string;
}

/**
 * Service for displaying various types of dialog messages and confirmations
 * 
 * @class SnackbarService
 * @description Manages success messages, error notifications, and confirmation dialogs
 * using Material Dialog components
 */
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private dialog: MatDialog) {}

  /**
   * Displays a success message dialog
   * 
   * @param {string} message - The success message to display
   * @param {boolean} [showBoardIcon=false] - Whether to show the board icon
   * @returns {void}
   */
  success(message: string, showBoardIcon: boolean = false): void {
    this.dialog.open(MessageDialogComponent, {
      width: 'auto',
      panelClass: 'success-dialog',
      data: { 
        type: 'success',
        message,
        showBoardIcon
      }
    });
  }

  /**
   * Displays an error message dialog
   * 
   * @param {string | MessageData} data - Error message or message data object
   * @returns {void}
   */
  error(data: string | MessageData): void {
    const message = typeof data === 'string' ? data : data.message;
    const secondLine = typeof data === 'string' ? undefined : data.secondLine;
    
    this.dialog.open(MessageDialogComponent, {
      width: 'auto',
      panelClass: 'error-dialog',
      data: { 
        type: 'error',
        message,
        secondLine
      }
    });
  }

  /**
   * Opens a confirmation dialog with Yes/No options
   * 
   * @param {ConfirmDialogData} data - Configuration for the confirm dialog
   * @returns {Observable<boolean>} Observable that resolves to true if confirmed, false otherwise
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: data.message,
        confirmButton: 'Yes',
        cancelButton: 'No'
      }
    });

    return dialogRef.afterClosed();
  }
}
