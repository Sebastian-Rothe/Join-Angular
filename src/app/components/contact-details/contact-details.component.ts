import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { User } from '../../models/user.class';
import { DialogService } from '../../services/dialog.service';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';
import { MobileMenuService } from '../../services/mobile-menu.service';

/**
 * Component for displaying and managing contact details.
 * 
 * Features:
 * - Displays detailed information about a selected contact
 * - Provides edit and delete functionality
 * - Supports both desktop and mobile views
 * - Includes animated menu transitions for mobile view
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
  imports: [CommonModule, MatIconModule, MatMenuModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
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

  /** Reference to the mobile menu trigger for animation control */
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  /**
   * Creates an instance of ContactDetailsComponent.
   * 
   * @param dialogService - Service for managing dialog windows
   * @param userService - Service for user CRUD operations
   * @param snackbarService - Service for displaying notifications
   */
  constructor(
    private dialogService: DialogService, 
    private userService: UserService,
    private snackbarService: SnackbarService,
    private mobileMenuService: MobileMenuService
  ) {
    this.mobileMenuService.editClick$.subscribe(() => {
      this.contactUpdated.emit();
    });

    this.mobileMenuService.deleteClick$.subscribe(() => {
      this.contactDeleted.emit();
    });
  }

  /**
   * Initializes click outside listener for mobile menu.
   * Sets up event handler to close menu when clicking outside.
   */
  ngOnInit(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const menuElement = document.querySelector('.mobile-actions-menu');
      const buttonElement = document.querySelector('.mobile-menu-button');
      
      if (menuElement && 
          buttonElement && 
          !menuElement.contains(event.target as Node) && 
          !buttonElement.contains(event.target as Node)) {
        this.closeMenu();
      }
    });
  }

  /**
   * Closes the mobile menu with animation.
   * Adds a hiding class for animation and removes it after transition.
   */
  closeMenu(): void {
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
   * Opens dialog to edit contact details.
   * Handles dialog result and emits update event if successful.
   * 
   * @returns {Promise<void>} Promise that resolves when dialog is closed
   * @fires contactUpdated
   * 
   * @example
   * ```typescript
   * await this.openEditDialog();
   * ```
   */
  async openEditDialog(): Promise<void> {
    if (this.contact) {
      const dialogRef = await this.dialogService.openDialog('edit', this.contact);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.contactUpdated.emit();
        }
      });
    }
  }

  /**
   * Deletes the current contact after confirmation.
   * Shows confirmation dialog and handles deletion process.
   * 
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @throws {Error} When deletion fails
   * @fires contactDeleted
   * @fires SnackbarService#success
   * @fires SnackbarService#error
   * 
   * @example
   * ```typescript
   * await this.deleteContact();
   * ```
   */
  async deleteContact(): Promise<void> {
    const uid = this.contact?.uid;
    if (uid) {
      this.snackbarService.confirm({
        message: 'Are you sure you want to delete this contact?'
      }).subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            await this.userService.deleteUser(uid);
            this.snackbarService.success('Contact successfully deleted');
            this.contactDeleted.emit();
          } catch (error) {
            this.snackbarService.error('Error deleting contact');
          }
        }
      });
    }
  }
}
