import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="image-viewer" (click)="close.emit()">
      <button class="close-btn" (click)="close.emit()">
        <mat-icon>close</mat-icon>
      </button>
      <button class="nav-btn prev" (click)="prev(); $event.stopPropagation()" *ngIf="hasMultipleImages">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <div class="image-container" (click)="$event.stopPropagation()">
        <img [src]="currentImage" [alt]="'Image ' + (currentIndex + 1)">
      </div>
      <button class="nav-btn next" (click)="next(); $event.stopPropagation()" *ngIf="hasMultipleImages">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  `,
  styles: [`
  @use '../../../styles.scss' as *;
    .image-viewer {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-container {
      position: relative;
      max-width: 90%;
      max-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 12px;
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &:hover {
        color: $primary-blue;
        transform: scale(1.2);
        transition: all 125ms ease-in-out;
        box-shadow: none;
      }
    }
    
    .nav-btn {
      position: absolute;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 24px;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
      
      &.prev { left: 0; }
      &.next { right: 0; }
      
      &:hover {
        color: $primary-blue;
        transform: scale(1.2);
        transition: all 125ms ease-in-out;
        box-shadow: none;
      }
    }
  `]
})
export class ImageViewerComponent {
  @Input() images: string[] = [];
  @Input() currentIndex = 0;
  @Output() close = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }

  get currentImage(): string {
    return this.images[this.currentIndex] || '';
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.indexChange.emit(this.currentIndex);
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.indexChange.emit(this.currentIndex);
  }
}
