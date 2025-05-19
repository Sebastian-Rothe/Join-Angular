import { Component, OnInit, HostBinding } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { ViewportResizeService } from '../services/viewport-resize.service';
import { tap } from 'rxjs/operators';

/**
 * Main content component that serves as the primary layout container.
 * 
 * @description
 * This component acts as the main structural container for the application,
 * incorporating the header, navigation bar, and the main content area.
 * It uses Angular's standalone component architecture and serves as a
 * wrapper for all authenticated content.
 * 
 * @example
 * ```html
 * <app-main-content>
 *   <!-- Child routes will be rendered here -->
 * </app-main-content>
 * ```
 */
@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, RouterModule],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {
  @HostBinding('class.height-exceeded')
  isHeightExceeded = false;

  constructor(private readonly viewportService: ViewportResizeService) {}

  ngOnInit() {
    this.viewportService.heightExceeded$.pipe(
      tap(exceeded => console.log('Height exceeded:', exceeded))
    ).subscribe(
      exceeded => this.isHeightExceeded = exceeded
    );
  }
}
