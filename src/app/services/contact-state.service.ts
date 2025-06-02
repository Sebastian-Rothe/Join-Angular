import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// Models
import { User } from '../models/user.class';

/**
 * Contact State Management Service
 * 
 * @description
 * Manages the state of contact-related UI interactions and selections.
 * Provides observables for tracking contact selection and detail view states.
 * 
 * @usageNotes
 * This service is primarily used to coordinate the state between:
 * - Contact list
 * - Contact details view
 * - Mobile responsive states
 * 
 * @example
 * ```typescript
 * constructor(private contactState: ContactStateService) {
 *   this.contactState.contactOpened$.subscribe(isOpen => {
 *     // Handle contact open/close state
 *   });
 * 
 *   this.contactState.currentContact$.subscribe(contact => {
 *     // Handle current contact changes
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ContactStateService {
  /** BehaviorSubject tracking if contact details are currently displayed */
  private contactOpenedSource = new BehaviorSubject<boolean>(false);
  
  /** Observable of the contact details view state */
  contactOpened$ = this.contactOpenedSource.asObservable();

  /** BehaviorSubject storing the currently selected contact */
  private currentContactSource = new BehaviorSubject<User | null>(null);
  
  /** Observable of the currently selected contact */
  currentContact$ = this.currentContactSource.asObservable();

  /**
   * Updates both the contact open state and current contact selection
   * 
   * @description 
   * Single method to handle both the visibility of contact details
   * and the currently selected contact. This ensures atomic updates
   * of related state.
   * 
   * @param isOpen - Whether the contact details should be displayed
   * @param contact - The contact to set as current (optional)
   * 
   * @example
   * ```typescript
   * // Open contact details with a specific contact
   * contactState.setContactOpened(true, selectedContact);
   * 
   * // Close contact details
   * contactState.setContactOpened(false);
   * ```
   */
  setContactOpened(isOpen: boolean, contact: User | null = null) {
    this.contactOpenedSource.next(isOpen);
    this.currentContactSource.next(contact);
  }
}
