import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';

/**
 * Interface defining the structure of image information
 */
interface ImageInfo {
  /** URL of the image */
  url: string;
  /** Original filename of the image */
  name: string;
  /** File size in bytes */
  size: number;
}

/**
 * A responsive image viewer component with zoom, pan, and navigation capabilities.
 * 
 * @description
 * This component provides a modal image viewer with the following features:
 * - Image zoom in/out with mouse wheel support
 * - Image panning when zoomed
 * - Navigation between multiple images
 * - Image download functionality
 * - File information display
 * 
 * @example
 * ```html
 * <app-image-viewer
 *   [images]="imageArray"
 *   [currentIndex]="0"
 *   (close)="handleClose()"
 *   (indexChange)="handleIndexChange($event)">
 * </app-image-viewer>
 * ```
 */
@Component({
  selector: 'app-image-viewer',
  standalone: true,
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  imports: [CommonModule, MatIconModule],
})
export class ImageViewerComponent {
  /** Array of images to display in the viewer */
  @Input() images: ImageInfo[] = [];
  
  /** Current image index being displayed */
  @Input() currentIndex = 0;
  
  /** Event emitter for closing the viewer */
  @Output() close = new EventEmitter<void>();
  
  /** Event emitter for index changes */
  @Output() indexChange = new EventEmitter<number>();

  /** Current zoom level (1 = 100%) */
  zoom = 1;
  
  /** Current position of the panned image */
  position = { x: 0, y: 0 };
  
  /** Flag for tracking pan state */
  private isPanning = false;
  
  /** Starting point for pan operation */
  private startPoint = { x: 0, y: 0 };
  
  /** Starting position for pan operation */
  private startPosition = { x: 0, y: 0 };
  
  /** Flag for tracking closing animation state */
  isClosing = false;

  /**
   * Checks if there are multiple images to navigate between
   * @returns boolean indicating if there are multiple images
   */
  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }

  /**
   * Gets the current image information
   * @returns The current ImageInfo object or undefined
   */
  get currentImageInfo(): ImageInfo | undefined {
    return this.images[this.currentIndex];
  }

  /**
   * Gets the URL of the current image
   * @returns The current image URL or empty string
   */
  get currentImage(): string {
    return this.currentImageInfo?.url || '';
  }

  /**
   * Navigates to the next image in the array
   */
  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.indexChange.emit(this.currentIndex);
  }

  /**
   * Navigates to the previous image in the array
   */
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.indexChange.emit(this.currentIndex);
  }

  /**
   * Initiates image panning operation
   * @param event Mouse event containing coordinates
   */
  startPan(event: MouseEvent): void {
    if (this.zoom <= 1) return;
    
    this.isPanning = true;
    this.startPoint = { x: event.clientX, y: event.clientY };
    this.startPosition = { ...this.position };
    event.preventDefault();
  }

  /**
   * Handles ongoing pan operation
   * @param event Mouse event containing coordinates
   */
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

  /**
   * Ends the pan operation
   */
  stopPan(): void {
    this.isPanning = false;
  }

  /**
   * Increases zoom level by 0.5 up to maximum of 3x
   */
  zoomIn(): void {
    if (this.zoom < 3) this.zoom += 0.5;
  }

  /**
   * Decreases zoom level by 0.5 down to minimum of 0.5x
   */
  zoomOut(): void {
    if (this.zoom > 0.5) {
      this.zoom -= 0.5;
      if (this.zoom === 1) {
        this.position = { x: 0, y: 0 }; // Reset position when zooming out to normal
      }
    }
  }

  /**
   * Formats file size into human-readable string
   * @param bytes File size in bytes
   * @returns Formatted string with appropriate unit
   */
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

  /**
   * Triggers download of current image
   */
  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.currentImage;
    link.download = this.currentImageInfo?.name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Handles mouse wheel events for zooming
   * @param event Wheel event
   */
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

  /**
   * Initiates closing animation and emits close event
   */
  closeViewer(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 300); // Match animation duration
  }
}
