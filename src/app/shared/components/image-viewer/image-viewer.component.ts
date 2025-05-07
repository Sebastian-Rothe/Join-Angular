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
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  imports: [CommonModule, MatIconModule],
})
export class ImageViewerComponent {
  @Input() images: ImageInfo[] = [];
  @Input() currentIndex = 0;
  @Output() close = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  zoom = 1;
  position = { x: 0, y: 0 };
  private isPanning = false;
  private startPoint = { x: 0, y: 0 };
  private startPosition = { x: 0, y: 0 };
  isClosing = false;

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

  startPan(event: MouseEvent): void {
    if (this.zoom <= 1) return;
    
    this.isPanning = true;
    this.startPoint = { x: event.clientX, y: event.clientY };
    this.startPosition = { ...this.position };
    event.preventDefault();
  }

  onPan(event: MouseEvent): void {
    if (!this.isPanning) return;
    
    const dx = event.clientX - this.startPoint.x;
    const dy = event.clientY - this.startPoint.y;
    
    this.position = {
      x: this.startPosition.x + dx / this.zoom,
      y: this.startPosition.y + dy / this.zoom
    };
    
    event.preventDefault();
  }

  stopPan(): void {
    this.isPanning = false;
  }

  zoomIn(): void {
    if (this.zoom < 3) this.zoom += 0.5;
  }

  zoomOut(): void {
    if (this.zoom > 0.5) {
      this.zoom -= 0.5;
      if (this.zoom === 1) {
        this.position = { x: 0, y: 0 }; // Reset position when zooming out to normal
      }
    }
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

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.25 : 0.25;
    const newZoom = Math.min(Math.max(this.zoom + delta, 0.5), 3);
    
    if (newZoom !== this.zoom) {
      this.zoom = newZoom;
      if (this.zoom === 1) {
        this.position = { x: 0, y: 0 };
      }
    }
  }

  closeViewer(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 300); // Match animation duration
  }
}
