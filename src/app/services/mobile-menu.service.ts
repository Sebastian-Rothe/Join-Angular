import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
// Services
import { DialogService } from './dialog.service';
import { SnackbarService } from './snackbar.service';
import { UserService } from './user.service';
// Models
import { User } from '../models/user.class';

/**
 * Mobile Menu Service
 * 
 * @description
 * Manages the state and operations for mobile menu interactions in the contact management system.
 * Handles contact editing, deletion, and state management for mobile view operations.
 * 
 * @usageNotes
 * This service is primarily used in conjunction with the MobileMenuOverlay component
 * and handles the communication between mobile menu actions and contact operations.
 * 
 * @example
 * ```typescript
 * constructor(private mobileMenuService: MobileMenuService) {
 *   this.mobileMenuService.currentContact$.subscribe(contact => {
 *     // Handle contact updates
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class MobileMenuService {
  /** BehaviorSubject storing the currently selected contact */
  private currentContactSource = new BehaviorSubject<User | null>(null);
  
  /** Observable of the current contact for component subscriptions */
  currentContact$ = this.currentContactSource.asObservable();

  /** Subject for edit action clicks */
  private editClickSource = new Subject<void>();
  
  /** Subject for delete action clicks */
  private deleteClickSource = new Subject<void>();

  /** Observable of edit clicks for component subscriptions */
  editClick$ = this.editClickSource.asObservable();
  
  /** Observable of delete clicks for component subscriptions */
  deleteClick$ = this.deleteClickSource.asObservable();

  /**
   * Creates an instance of MobileMenuService.
   * 
   * @param dialogService - Service for managing dialog windows
   * @param userService - Service for user CRUD operations
   * @param snackbarService - Service for displaying notifications
   */
  constructor(
    private dialogService: DialogService,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Updates the current contact in the service state.
   * 
   * @param contact - The contact to set as current, or null to clear
   */
  setCurrentContact(contact: User | null) {
    this.currentContactSource.next(contact);
  }

  /**
   * Handles the edit operation for the current contact.
   * 
   * @async
   * @description
   * Opens an edit dialog for the current contact and emits an edit event
   * if the dialog is confirmed.
   * 
   * @throws Will not open dialog if no current contact exists
   */
  async handleEdit() {
    const contact = this.currentContactSource.getValue();
    if (contact) {
      const dialogRef = await this.dialogService.openDialog('edit', contact);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.editClickSource.next();
        }
      });
    }
  }

  /**
   * Handles the delete operation for the current contact.
   * 
   * @async
   * @description
   * Shows a confirmation dialog and deletes the contact if confirmed.
   * Emits a delete event on successful deletion.
   * 
   * @throws Will not proceed if contact has no UID
   * @throws Will show error notification if deletion fails
   */
  async handleDelete() {
    const contact = this.currentContactSource.getValue();
    const uid = contact?.uid;
    if (!uid) return;

    this.snackbarService.confirm({
      message: 'Are you sure you want to delete this contact?'
    }).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.userService.deleteUser(uid);
          this.snackbarService.success('Contact successfully deleted');
          this.deleteClickSource.next();
        } catch (error) {
          this.snackbarService.error('Error deleting contact');
        }
      }
    });
  }
}
