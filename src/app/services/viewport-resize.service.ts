import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Viewport Resize Service
 * 
 * @description
 * Monitors viewport height changes and notifies subscribers when height exceeds
 * a maximum threshold. Useful for responsive layout adjustments and scroll behavior
 * management.
 * 
 * @usageNotes
 * The service automatically initializes viewport monitoring on construction and
 * maintains state through window resize events.
 * 
 * @example
 * ```typescript
 * constructor(private viewportResize: ViewportResizeService) {
 *   this.viewportResize.heightExceeded$.subscribe(exceeded => {
 *     // Handle layout adjustments based on height threshold
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ViewportResizeService {
  /** Maximum allowed viewport height before triggering exceeded state */
  private readonly MAX_HEIGHT = 1375;

  /** BehaviorSubject tracking if viewport height exceeds maximum */
  private heightExceeded = new BehaviorSubject<boolean>(false);

  /** Observable of the height exceeded state */
  heightExceeded$ = this.heightExceeded.asObservable();

  /**
   * Creates an instance of ViewportResizeService.
   * Initializes viewport monitoring and sets up resize event listener.
   */
  constructor() {
    this.checkViewportHeight();
    window.addEventListener('resize', () => this.checkViewportHeight());
  }

  /**
   * Checks current viewport height against maximum threshold
   * 
   * @private
   * @description
   * Compares window.innerHeight with MAX_HEIGHT and updates
   * heightExceeded BehaviorSubject if state has changed.
   * Only emits when the exceeded state actually changes to
   * prevent unnecessary updates.
   */
  private checkViewportHeight(): void {
    const exceeds = window.innerHeight > this.MAX_HEIGHT;
    if (exceeds !== this.heightExceeded.value) {
      this.heightExceeded.next(exceeds);
    }
  }
}
