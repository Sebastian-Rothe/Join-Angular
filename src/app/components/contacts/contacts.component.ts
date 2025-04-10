import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, MatIconModule, ContactDetailsComponent, ActionDialogComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  isContactDetailsVisible = false;
  isMobileView = false;
  contacts: User[] = [];
  groupedContacts: { [key: string]: User[] } = {};
  selectedContact: User | null = null;
  isSlideIn = false;
  isSlideOut = false;

  constructor(
    private userService: UserService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.loadContacts();
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth <= 850;
  }

  private async loadContacts() {
    this.contacts = await this.userService.getAllUsers();
    this.groupContacts();
  }

  private groupContacts() {
    this.groupedContacts = {};
    this.contacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!this.groupedContacts[firstLetter]) {
        this.groupedContacts[firstLetter] = [];
      }
      this.groupedContacts[firstLetter].push(contact);
    });
  }

  onContactSelect(contact: User) {
    if (this.selectedContact) {
      // Slide out current contact
      this.isSlideIn = false;
      this.isSlideOut = true;
      
      setTimeout(() => {
        this.selectedContact = contact;
        this.isSlideOut = false;
        
        // Trigger slide in animation in next frame
        requestAnimationFrame(() => {
          this.isSlideIn = true;
        });
        
        if (this.isMobileView) {
          this.isContactDetailsVisible = true;
        }
      }, 200); // Match sliding-out animation duration
    } else {
      // First contact selection
      this.selectedContact = contact;
      requestAnimationFrame(() => {
        this.isSlideIn = true;
      });
      if (this.isMobileView) {
        this.isContactDetailsVisible = true;
      }
    }
  }

  onBackToList() {
    this.isContactDetailsVisible = false;
  }

  openNewContactDialog(): void {
    this.dialogService.openDialog('add');
    console.log('New contact dialog opened');
    
  }
}