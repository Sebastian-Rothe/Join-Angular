import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

/**
 * Interface for configuring the message dialog
 * 
 * @interface MessageDialogData
 * @property {('success' | 'error')} type - The type of message to display
 * @property {string} message - The main message text
 * @property {string} [secondLine] - Optional secondary message text
 * @property {boolean} [showBoardIcon] - Optional flag to show board icon (only for success type)
 */
export interface MessageDialogData {
  type: 'success' | 'error';
  message: string;
  secondLine?: string;
  showBoardIcon?: boolean;
}

/**
 * A material design dialog component for displaying temporary messages.
 * 
 * @description
 * This component displays a dialog with success or error messages that automatically
 * dismisses itself after a short duration. It includes animations for smooth
 * appearance and disappearance.
 * 
 * @example
 * ```typescript
 * this.dialog.open(MessageDialogComponent, {
 *   data: {
 *     type: 'success',
 *     message: 'Operation completed successfully',
 *     showBoardIcon: true
 *   }
 * });
 * ```
 */
@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  styleUrls: ['./message-dialog.component.scss'],
  template: `
    <div class="message-dialog {{ data.type }}" [class.aktiv]="isVisible">
      <div class="message">{{ data.message }}</div>
      @if(data.type === 'success' && data.showBoardIcon) {
        <div class="icon-container">
          <img src="/assets/icons/Board.svg" alt="Board Icon">
        </div>
      }
    </div>
  `,
})
export class MessageDialogComponent implements OnInit {
  /** Controls the visibility state for animation purposes */
  isVisible = false;

  /**
   * Creates an instance of MessageDialogComponent.
   * 
   * @param dialogRef - Reference to the dialog instance
   * @param data - Configuration data for the message dialog
   */
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
  ) {}

  /**
   * Lifecycle hook that handles the dialog's appearance and disappearance timing.
   * - Shows the dialog after 50ms
   * - Starts closing animation after 2.2 seconds
   * - Completely closes the dialog after the closing animation (225ms)
   */
  ngOnInit() {
    setTimeout(() => this.isVisible = true, 50);
    setTimeout(() => {
      this.isVisible = false;
      setTimeout(() => this.dialogRef.close(), 225);
    }, 2200);
  }
}
