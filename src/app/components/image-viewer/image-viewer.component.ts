import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface ImageInfo {
  url: string;
  name: string;
  size: number;
}

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="image-viewer" (click)="close.emit()">
      <div class="viewer-container" (click)="$event.stopPropagation()">
        <div class="header-bar">
          <div class="file-info">
            <span class="filename">{{ currentImageInfo?.name }}</span>
            <span class="filesize">{{ formatFileSize(currentImageInfo?.size) }}</span>
          </div>
          <div class="zoom-controls">
            <button (click)="zoomOut()"><mat-icon>zoom_out</mat-icon></button>
            <button (click)="zoomIn()"><mat-icon>zoom_in</mat-icon></button>
          </div>
          <div class="action-controls">
            <button (click)="downloadImage()"><mat-icon>cloud_download</mat-icon></button>
            <button (click)="close.emit()"><mat-icon>close</mat-icon></button>
          </div>
        </div>
        
        <div class="content-area">
          <button class="nav-btn prev" (click)="prev(); $event.stopPropagation()" *ngIf="hasMultipleImages">
            <mat-icon>chevron_left</mat-icon>
          </button>
          
          <div class="image-container" [style.transform]="'scale(' + zoom + ')'">
            <img [src]="currentImage" [alt]="'Image ' + (currentIndex + 1)">
          </div>

          <button class="nav-btn next" (click)="next(); $event.stopPropagation()" *ngIf="hasMultipleImages">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>
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

    .viewer-container {
      position: relative;
      width: min(90vw, 1200px);
      height: min(90vh, 800px);
      background: black;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .header-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 2;

      .file-info {
        color: white;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        .filename {
          font-weight: 500;
        }

        .filesize {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }
      }

      .zoom-controls {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        justify-content: center;
      }

      .action-controls {
        display: flex;
        gap: 8px;
      }

      button {
        background: none;
        border: none;
        color: white;
        padding: 8px;

        &:hover {
          color: $primary-blue;
          transform: scale(1.1);
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    .content-area {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      cursor: pointer;
      padding: 16px 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 2;
      width: 64px; // Added fixed width
      height: 64px; // Added fixed height
      display: flex; // Added for centering icon
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
        color: $primary-blue;
      }

      mat-icon {
        font-size: 36px;
      }

      &.prev { 
        left: 20px; 
        border-radius: 50%;  // Changed to circle
      }
      &.next { 
        right: 20px; 
        border-radius: 50%;  // Changed to circle
      }
    }

    .viewer-container:hover {
      .header-bar, .nav-btn {
        opacity: 1;
      }
    }
  `]
})
export class ImageViewerComponent {
  @Input() images: ImageInfo[] = [];
  @Input() currentIndex = 0;
  @Output() close = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  zoom = 1;

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }

  get currentImageInfo(): ImageInfo | undefined {
    return this.images[this.currentIndex];
  }

  get currentImage(): string {
    return this.currentImageInfo?.url || '';
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.indexChange.emit(this.currentIndex);
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.indexChange.emit(this.currentIndex);
  }

  zoomIn(): void {
    if (this.zoom < 3) this.zoom += 0.5;
  }

  zoomOut(): void {
    if (this.zoom > 0.5) this.zoom -= 0.5;
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.currentImage;
    link.download = this.currentImageInfo?.name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
