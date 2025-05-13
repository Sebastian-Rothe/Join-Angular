import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private header: HTMLElement | null = null;
  private originalZIndex: string = '';

  setHeaderElement(header: HTMLElement) {
    this.header = header;
    this.originalZIndex = this.header.style.zIndex;
  }

  setHeaderZIndex(value: string) {
    if (this.header) {
      this.header.style.zIndex = value;
    }
  }

  resetHeaderZIndex() {
    if (this.header) {
      this.header.style.zIndex = this.originalZIndex;
    }
  }
}
