import { Injectable } from '@angular/core';

/**
 * Service for managing the z-index of the header component.
 * 
 * @description
 * This service provides functionality to dynamically control the z-index
 * of the header element, particularly useful when dealing with overlays
 * and modals that need to appear above or below the header.
 * 
 * @example
 * ```typescript
 * constructor(private headerService: HeaderService) {
 *   this.headerService.setHeaderElement(headerElement);
 *   this.headerService.setHeaderZIndex('0');
 *   this.headerService.resetHeaderZIndex();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  /** Reference to the header DOM element */
  private header: HTMLElement | null = null;
  /** Stores the original z-index value of the header */
  private originalZIndex: string = '';

  /**
   * Sets the header element reference and stores its original z-index.
   * 
   * @param header - The header DOM element to be managed
   */
  setHeaderElement(header: HTMLElement) {
    this.header = header;
    this.originalZIndex = this.header.style.zIndex;
  }

  /**
   * Updates the z-index of the header element.
   * 
   * @param value - The new z-index value to be applied
   */
  setHeaderZIndex(value: string) {
    if (this.header) {
      this.header.style.zIndex = value;
    }
  }

  /**
   * Restores the header's z-index to its original value.
   * Typically called after an overlay or modal is closed.
   */
  resetHeaderZIndex() {
    if (this.header) {
      this.header.style.zIndex = this.originalZIndex;
    }
  }
}
