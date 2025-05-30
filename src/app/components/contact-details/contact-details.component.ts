import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.class';
import { MobileMenuService } from '../../services/mobile-menu.service';

/**
 * Component for displaying and managing contact details.
 *
 * Features:
 * - Displays detailed information about a selected contact
 * - Provides edit and delete functionality
 * - Supports both desktop and mobile views
 * - Emits events for contact updates and deletions
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
  /** The contact user object to display details for */
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

  /** Event emitter that fires when contact is updated */
  @Output() contactUpdated = new EventEmitter<void>();

  /** Event emitter that fires when contact is deleted */
  @Output() contactDeleted = new EventEmitter<void>();

  /**
   * Creates an instance of ContactDetailsComponent.
   *
   * @param dialogService - Service for managing dialog windows
   * @param userService - Service for user CRUD operations
   * @param snackbarService - Service for displaying notifications
   */
  constructor(private mobileMenuService: MobileMenuService) {
    this.mobileMenuService.editClick$.subscribe(() => {
      this.contactUpdated.emit();
    });

    this.mobileMenuService.deleteClick$.subscribe(() => {
      this.contactDeleted.emit();
    });
  }
  deleteContact() {
    this.mobileMenuService.handleDelete();
  }
  openEditDialog() {
    this.mobileMenuService.handleEdit();
  }
}
