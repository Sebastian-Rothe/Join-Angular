import { Component, Inject, OnInit } from '@angular/core';
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
  isVisible = false;

  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
  ) {}

  ngOnInit() {
    setTimeout(() => this.isVisible = true, 50);
    setTimeout(() => {
      this.isVisible = false;
      setTimeout(() => this.dialogRef.close(), 225);
    }, 2200);
  }
}
