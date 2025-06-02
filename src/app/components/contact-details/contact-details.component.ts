import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.class';
import { MobileMenuService } from '../../services/mobile-menu.service';

/**
 * Component for displaying and managing contact details.
 *
 * @description
 * Provides a detailed view of a selected contact with options to edit and delete.
 * Integrates with MobileMenuService for mobile-specific functionality.
 * 
 * Features:
 * - Displays detailed information about a selected contact
 * - Provides edit and delete functionality
 * - Supports both desktop and mobile views
 * - Emits events for contact updates and deletions
 * - Syncs with mobile menu service for responsive design
 *
 * @example
 * ```html
 * <app-contact-details
 *   [contact]="selectedContact"
 *   [isMobileView]="true"
 *   (contactUpdated)="handleContactUpdate()"
 *   (contactDeleted)="handleContactDelete()">
 * </app-contact-details>
 * ```
 */
@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
})
export class ContactDetailsComponent {
  /** 
   * The contact user object to display details for.
   * Updates the mobile menu service when value changes.
   */
  @Input() set contact(value: User | null) {
    this._contact = value;
    this.mobileMenuService.setCurrentContact(value);
  }
  get contact() {
    return this._contact;
  }
  private _contact: User | null = null;

  /** Flag indicating if component is being rendered in mobile view */
  @Input() isMobileView = false;

  /** Emits when a contact is successfully updated through the edit dialog */
  @Output() contactUpdated = new EventEmitter<void>();

  /** Emits when a contact is successfully deleted */
  @Output() contactDeleted = new EventEmitter<void>();

  /**
   * Creates an instance of ContactDetailsComponent.
   * Sets up subscriptions to mobile menu service events.
   *
   * @param mobileMenuService - Service for managing mobile-specific menu operations
   */
  constructor(private mobileMenuService: MobileMenuService) {
    this.mobileMenuService.editClick$.subscribe(() => {
      this.contactUpdated.emit();
    });

    this.mobileMenuService.deleteClick$.subscribe(() => {
      this.contactDeleted.emit();
    });
  }

  /**
   * Initiates the contact deletion process.
   * 
   * @description
   * Delegates the delete operation to the mobile menu service.
   * The service will handle confirmation and actual deletion.
   * On successful deletion, the contactDeleted event will be emitted.
   */
  deleteContact() {
    this.mobileMenuService.handleDelete();
  }

  /**
   * Opens the edit dialog for the current contact.
   * 
   * @description
   * Delegates the edit operation to the mobile menu service.
   * The service will handle dialog display and contact updating.
   * On successful edit, the contactUpdated event will be emitted.
   */
  openEditDialog() {
    this.mobileMenuService.handleEdit();
  }
}
