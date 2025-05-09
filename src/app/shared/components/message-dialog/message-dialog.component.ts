import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

export interface MessageDialogData {
  type: 'success' | 'error';
  message: string;
  secondLine?: string;
}

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  styleUrls: ['./message-dialog.component.scss'],
  template: `
    <div class="message-dialog {{ data.type }}">
      <div class="icon-container">
        @if(data.type === 'success'){
          <mat-icon>task_alt</mat-icon>
        }
      </div>
      <div class="message">
        {{ data.message }}
        @if(data.secondLine) {
          <div class="second-line">{{ data.secondLine }}</div>
        }
      </div>
    </div>
  `,
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
  ) {
    setTimeout(() => this.dialogRef.close(), 250000);
  }
}
