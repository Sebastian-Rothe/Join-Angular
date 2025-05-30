import { Component, Inject } from '@angular/core';
// Angular imports
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * A reusable confirmation dialog component using Angular Material.
 * 
 * @description
 * This component creates a modal dialog that asks users to confirm or cancel an action.
 * It can be customized with different messages and button texts through the input data.
 * 
 * @example
 * ```typescript
 * const dialogRef = this.dialog.open(ConfirmDialogComponent, {
 *   data: {
 *     message: 'Are you sure you want to delete this item?',
 *     confirmButton: 'Delete',
 *     cancelButton: 'Cancel'
 *   }
 * });
 * 
 * dialogRef.afterClosed().subscribe(result => {
 *   if (result) {
 *     // User confirmed the action
 *   }
 * });
 * ```
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  /**
   * Creates an instance of ConfirmDialogComponent.
   * 
   * @param dialogRef - Reference to the dialog opened
   * @param data - Configuration object for the dialog
   * @param data.message - The message to display in the dialog
   * @param data.confirmButton - Text for the confirm button
   * @param data.cancelButton - Text for the cancel button
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      message: string;
      confirmButton: string;
      cancelButton: string;
    }
  ) {}

  /**
   * Handles the cancel button click event.
   * Closes the dialog and returns false to indicate cancellation.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Handles the confirm button click event.
   * Closes the dialog and returns true to indicate confirmation.
   */
  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
