import { Component, OnInit, HostBinding } from '@angular/core';
import { RouterModule } from '@angular/router';
// Services
import { ViewportResizeService } from '../services/viewport-resize.service';
// Components
import { HeaderComponent } from '../shared/components/header/header.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

/**
 * Main content component that serves as the primary layout container.
 * 
 * @description
 * This component acts as the main structural container for the application,
 * incorporating the header, navigation bar, and the main content area.
 * It uses Angular's standalone component architecture and handles viewport
 * height monitoring through the ViewportResizeService.
 * 
 * Features:
 * - Responsive layout container
 * - Automatic height overflow detection
 * - Integration with header and navigation components
 * 
 * @property {boolean} isHeightExceeded - Tracks if the content height exceeds viewport
 * 
 * @usageNotes
 * The component automatically subscribes to viewport changes on initialization
 * and applies the 'height-exceeded' class when necessary.
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
    this.viewportService.heightExceeded$.subscribe(
      exceeded => this.isHeightExceeded = exceeded
    );
  }
}
