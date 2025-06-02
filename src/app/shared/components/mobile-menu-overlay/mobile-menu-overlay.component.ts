import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
// Services
import { MobileMenuService } from '../../../services/mobile-menu.service';
// Models
import { User } from '../../../models/user.class';

/**
 * Mobile Menu Overlay Component
 * 
 * @description
 * Provides a mobile-friendly menu overlay with edit and delete actions for contact management.
 * This component is specifically designed for mobile view of contact details.
 * 
 * @features
 * - Floating action menu button with Material icons
 * - Animation support for menu transitions
 * - Click-outside detection for menu closing
 * - Integration with MobileMenuService for contact operations
 * 
 * @example
 * ```html
 * <app-mobile-menu-overlay></app-mobile-menu-overlay>
 * ```
 */
@Component({
  selector: 'app-mobile-menu-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  styleUrls: ['./mobile-menu-overlay.component.scss'],
  template: `
    <button class="mobile-menu-button" [matMenuTriggerFor]="menu">
      <mat-icon>more_vert</mat-icon>
    </button>

    <mat-menu #menu="matMenu" 
              class="mobile-actions-menu"
              [hasBackdrop]="true"
              [overlapTrigger]="false">
      <button mat-menu-item (click)="handleEdit()">
        <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="handleDelete()">
        <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `
})
export class MobileMenuOverlayComponent implements OnInit {
  /** Reference to the Material Menu Trigger for programmatic control */
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  
  /** Stores the currently selected contact for edit/delete operations */
  private currentContact: User | null = null;

  /**
   * Creates an instance of MobileMenuOverlayComponent.
   * 
   * @param mobileMenuService - Service for handling mobile menu operations
   */
  constructor(
    private mobileMenuService: MobileMenuService
  ) {
    this.mobileMenuService.currentContact$.subscribe(
      contact => this.currentContact = contact
    );
  }

  /**
   * Initializes click-outside detection for menu closing.
   * Sets up event listener for clicks outside the menu area.
   */
  ngOnInit(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const menuElement = document.querySelector('.mobile-actions-menu');
      const buttonElement = document.querySelector('.mobile-menu-button');
      
      if (menuElement && 
          buttonElement && 
          !menuElement.contains(event.target as Node) && 
          !buttonElement.contains(event.target as Node)) {
        this.closeMenuWithAnimation();
      }
    });
  }

  /**
   * Closes the menu with a fade-out animation.
   * 
   * @private
   * @description
   * Adds a 'hiding' class for animation and removes it after animation completes.
   * Uses setTimeout to ensure proper animation timing.
   */
  private closeMenuWithAnimation() {
    const panel = document.querySelector('.mobile-actions-menu');
    if (panel) {
      panel.classList.add('hiding');
      setTimeout(() => {
        this.menuTrigger.closeMenu();
        panel.classList.remove('hiding');
      }, 280);
    }
  }

  /**
   * Handles the edit action for the current contact.
   * 
   * @async
   * @description
   * Triggers edit operation through MobileMenuService and closes the menu.
   * Only executes if a current contact exists.
   */
  async handleEdit() {
    if (this.currentContact) {
      await this.mobileMenuService.handleEdit();
      this.closeMenuWithAnimation();
    }
  }

  /**
   * Handles the delete action for the current contact.
   * 
   * @async
   * @description
   * Triggers delete operation through MobileMenuService and closes the menu.
   * Only executes if a current contact with valid UID exists.
   */
  async handleDelete() {
    if (this.currentContact?.uid) {
      await this.mobileMenuService.handleDelete();
      this.closeMenuWithAnimation();
    }
  }
}
