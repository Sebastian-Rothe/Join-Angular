import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from '../shared/components/message-dialog/message-dialog.component';

interface ConfirmDialogData {
  message: string;
}

interface MessageData {
  message: string;
  secondLine?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private dialog: MatDialog) {}

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
