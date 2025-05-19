import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewportResizeService {
  private readonly MAX_HEIGHT = 1375; 
  private heightExceeded = new BehaviorSubject<boolean>(false);
  heightExceeded$ = this.heightExceeded.asObservable();

  constructor() {
    this.checkViewportHeight();
    window.addEventListener('resize', () => this.checkViewportHeight());
  }

  private checkViewportHeight(): void {
    const exceeds = window.innerHeight > this.MAX_HEIGHT;
    if (exceeds !== this.heightExceeded.value) {
      this.heightExceeded.next(exceeds);
    }
  }
}
