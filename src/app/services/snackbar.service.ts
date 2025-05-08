import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
interface ConfirmDialogData {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  /**
   * Shows a success message
   */
  success(message: string, duration: number = 3000) {
    const config: MatSnackBarConfig = {
      duration: duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };
    this.snackBar.open(message, 'Close', config);
  }

  /**
   * Shows an error message
   */
  error(message: string, duration: number = 3000) {
    const config: MatSnackBarConfig = {
      duration: duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };
    this.snackBar.open(message, 'Close', config);
  }

  /**
   * Shows a confirmation dialog
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
