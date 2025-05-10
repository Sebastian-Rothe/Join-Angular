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
  showBoardIcon?: boolean;
}

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  styleUrls: ['./message-dialog.component.scss'],
  template: `
    <div class="message-dialog {{ data.type }}">
        <div class="message">
            {{ data.message }}
            @if(data.secondLine) {
                <div class="second-line">{{ data.secondLine }}</div>
            }
        </div>
        <div class="icon-container">
          @if(data.type === 'success' && data.showBoardIcon) {
            <img src="/assets/icons/Board.svg" alt="Board Icon">
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
    setTimeout(() => this.dialogRef.close(), 2500);
  }
}
