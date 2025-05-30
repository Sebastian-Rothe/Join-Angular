import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
// Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
// Services
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ContactStateService } from '../../services/contact-state.service';
// Components
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';
// Models
import { User } from '../../models/user.class';

/**
 * Component for managing and displaying user contacts.
 * 
 * This component provides a comprehensive interface for:
 * - Displaying contacts in an alphabetically sorted list
 * - Grouping contacts by first letter
 * - Viewing detailed contact information
 * - Adding new contacts
 * - Deleting existing contacts
 * - Responsive design with mobile/desktop views
 * 
 * Features:
 * - Alphabetical contact sorting and grouping
 * - Animated contact detail transitions
 * - Responsive layout adaptation
 * - Real-time contact list updates
 * - Contact filtering (excludes current user and guest accounts)
 * 
 * @example
 * ```html
 * <app-contacts></app-contacts>
 * ```
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, MatIconModule, ContactDetailsComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
  /** Flag to control contact details visibility in mobile view */
  isContactDetailsVisible = false;

  /** Flag indicating if component is in mobile view mode */
  isMobileView = false;

  /** Array of all contacts */
  contacts: User[] = [];

  /** Contacts grouped by first letter of name */
  groupedContacts: { [key: string]: User[] } = {};

  /** Currently selected contact for viewing details */
  selectedContact: User | null = null;

  /** Animation state for sliding in contact details */
  isSlideIn = false;

  /** Animation state for sliding out contact details */
  isSlideOut = false;

  /** Reference to the logged-in user */
  currentUser: User | null = null;

  /**
   * Creates an instance of ContactsComponent.
   * 
   * @param userService - Service for managing user data
   * @param dialogService - Service for managing dialog windows
   * @param snackbarService - Service for displaying notifications
   */
  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
    private contactStateService: ContactStateService
  ) {}

  /**
   * Initializes component by loading current user, checking screen size,
   * setting up resize listener, and loading contacts.
   */
  ngOnInit() {
    this.getCurrentUser();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.loadContacts();
  }

  /**
   * Retrieves the current user from the UserService.
   */
  private async getCurrentUser() {
    this.currentUser = await firstValueFrom(this.userService.currentUser$);
  }

  /**
   * Loads and processes all contacts from the backend.
   * Handles errors with user notification.
   * 
   * @returns Promise<void>
   */
  public async loadContacts() {
    try {
      const allUsers = await this.userService.getAllUsers();
      this.processContacts(allUsers);
      this.updateSelectedContactIfNeeded();
    } catch (error) {
      this.snackbarService.error('Failed to load contacts');
    }
  }

  /**
   * Processes the contacts by filtering, sorting, and grouping them.
   * 
   * @param allUsers - Array of all users from the backend
   */
  private processContacts(allUsers: User[]): void {
    this.contacts = this.filterContacts(allUsers);
    this.sortContacts();
    this.groupContacts();
  }

  /**
   * Filters out current user and guest accounts from contacts list.
   * 
   * @param users - Array of users to filter
   * @returns Filtered array of users
   */
  private filterContacts(users: User[]): User[] {
    return users.filter(user => 
      user.uid !== this.currentUser?.uid && 
      user.email !== 'guest@temporary.com'
    );
  }

  /**
   * Sorts contacts alphabetically by name.
   */
  private sortContacts(): void {
    this.contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Updates the selected contact with fresh data if it exists in contacts list.
   */
  private updateSelectedContactIfNeeded(): void {
    if (!this.selectedContact) return;
    
    const updatedContact = this.contacts.find(c => c.uid === this.selectedContact?.uid);
    if (updatedContact) {
      this.selectedContact = updatedContact;
    }
  }

  /**
   * Groups contacts by the first letter of their name.
   * Creates an object with letters as keys and arrays of contacts as values.
   */
  private groupContacts() {
    this.groupedContacts = {};
    this.contacts.forEach((contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!this.groupedContacts[firstLetter]) {
        this.groupedContacts[firstLetter] = [];
      }
      this.groupedContacts[firstLetter].push(contact);
    });
  }

  /**
   * Handles contact selection with appropriate animations.
   * 
   * @param contact - The contact being selected
   */
  onContactSelect(contact: User) {
    if (this.selectedContact) {
      this.handleContactSwitch(contact);
    } else {
      this.handleFirstContactSelection(contact);
    }
  }

  /**
   * Handles the animation and state updates when switching between contacts.
   * 
   * @param contact - The new contact to switch to
   */
  private handleContactSwitch(contact: User): void {
    this.startSlideOutAnimation();
    this.scheduleContactUpdate(contact);
  }

  /**
   * Handles the initial selection of a contact.
   * 
   * @param contact - The contact being selected
   */
  private handleFirstContactSelection(contact: User): void {
    this.selectedContact = contact;
    this.startSlideInAnimation();
    this.updateMobileView();
    if (this.isMobileView) {
      this.contactStateService.setContactOpened(true, contact);
    }
  }

  /**
   * Starts the slide out animation for contact details.
   */
  private startSlideOutAnimation(): void {
    this.isSlideIn = false;
    this.isSlideOut = true;
  }

  /**
   * Starts the slide in animation for contact details.
   * Uses requestAnimationFrame for smooth animation.
   */
  private startSlideInAnimation(): void {
    requestAnimationFrame(() => {
      this.isSlideIn = true;
    });
  }

  /**
   * Schedules the update of contact details after animation.
   * 
   * @param newContact - The contact to update to
   */
  private scheduleContactUpdate(newContact: User): void {
    setTimeout(() => {
      this.selectedContact = newContact;
      this.isSlideOut = false;
      this.startSlideInAnimation();
      this.updateMobileView();
      if (this.isMobileView) {
        this.contactStateService.setContactOpened(true, newContact);
      }
    }, 200);
  }

  /**
   * Updates mobile view state when necessary.
   */
  private updateMobileView(): void {
    if (this.isMobileView) {
      this.isContactDetailsVisible = true;
    }
  }

  /**
   * Handles navigation back to the contact list in mobile view.
   * Includes slide out animation.
   */
  onBackToList() {
    this.isSlideIn = false;
    this.isSlideOut = true;
    
    setTimeout(() => {
      this.isContactDetailsVisible = false;
      this.selectedContact = null;
      this.isSlideOut = false;
      this.contactStateService.setContactOpened(false);
    }, 200); // Match animation duration
  }

  /**
   * Opens dialog for creating a new contact.
   * Reloads contacts list if a new contact is added.
   * 
   * @returns Promise<void>
   */
  async openNewContactDialog(): Promise<void> {
    const dialogRef = await this.dialogService.openDialog('add');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContacts();
      }
    });
  }

  /**
   * Handles contact deletion by resetting view state and reloading contacts.
   */
  onContactDeleted() {
    this.selectedContact = null;
    this.isContactDetailsVisible = false;
    this.contactStateService.setContactOpened(false);
    this.loadContacts();
  }

  /**
   * Checks the screen size and updates the mobile view state.
   */
  private checkScreenSize() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth <= 850;
    
    // Update contact state when switching between mobile/desktop
    if (this.isMobileView !== wasMobile && this.selectedContact) {
      this.contactStateService.setContactOpened(this.isMobileView, this.selectedContact);
    }
  }

  /**
   * Shows the details of the selected contact and updates the contact state.
   * 
   * @param contact - The contact whose details are to be shown
   */
  showContactDetails(contact: User) {
    this.selectedContact = contact;
    this.contactStateService.setContactOpened(true, contact);
  }

  /**
   * Closes the contact details view and updates the contact state.
   */
  closeContactDetails() {
    this.selectedContact = null;
    this.contactStateService.setContactOpened(false);
  }
}
