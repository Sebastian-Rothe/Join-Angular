import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Help component that displays application usage instructions and documentation.
 * 
 * @description
 * This component provides a dedicated help page with information about how to use
 * the application. It includes navigation functionality to return to the previous page.
 * 
 * @example
 * ```html
 * <app-help></app-help>
 * ```
 */
@Component({
  selector: 'app-help',
  imports: [MatIconModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  /**
   * Creates an instance of HelpComponent.
   * 
   * @param location - Angular Location service for handling navigation
   */
  constructor(private location: Location) {}

  /**
   * Navigates back to the previous page in the browser's history.
   * Uses Angular's Location service to handle the navigation.
   */
  goBack() {
    this.location.back();
  }
}
