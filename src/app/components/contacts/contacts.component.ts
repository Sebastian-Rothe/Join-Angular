import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';
import { User } from '../../models/user.class';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, MatIconModule, ContactDetailsComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
  isContactDetailsVisible = false;
  isMobileView = false;
  contacts: User[] = [];
  groupedContacts: { [key: string]: User[] } = {};
  selectedContact: User | null = null;
  isSlideIn = false;
  isSlideOut = false;
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.loadContacts();
  }

  private async getCurrentUser() {
    this.currentUser = await firstValueFrom(this.userService.currentUser$);
  }

  
  public async loadContacts() {
    try {
      const allUsers = await this.userService.getAllUsers();
      this.processContacts(allUsers);
      this.updateSelectedContactIfNeeded();
    } catch (error) {
      this.snackbarService.error('Failed to load contacts');
    }
  }


  private processContacts(allUsers: User[]): void {
    this.contacts = this.filterContacts(allUsers);
    this.sortContacts();
    this.groupContacts();
  }

 
  private filterContacts(users: User[]): User[] {
    return users.filter(user => 
      user.uid !== this.currentUser?.uid && 
      user.email !== 'guest@temporary.com'
    );
  }

 
  private sortContacts(): void {
    this.contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

 
   
  private updateSelectedContactIfNeeded(): void {
    if (!this.selectedContact) return;
    
    const updatedContact = this.contacts.find(c => c.uid === this.selectedContact?.uid);
    if (updatedContact) {
      this.selectedContact = updatedContact;
    }
  }

 
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


  onContactSelect(contact: User) {
    if (this.selectedContact) {
      this.handleContactSwitch(contact);
    } else {
      this.handleFirstContactSelection(contact);
    }
  }

 
  private handleContactSwitch(contact: User): void {
    this.startSlideOutAnimation();
    this.scheduleContactUpdate(contact);
  }


  private handleFirstContactSelection(contact: User): void {
    this.selectedContact = contact;
    this.startSlideInAnimation();
    this.updateMobileView();
  }


  private startSlideOutAnimation(): void {
    this.isSlideIn = false;
    this.isSlideOut = true;
  }

  
  private startSlideInAnimation(): void {
    requestAnimationFrame(() => {
      this.isSlideIn = true;
    });
  }


  private scheduleContactUpdate(newContact: User): void {
    setTimeout(() => {
      this.selectedContact = newContact;
      this.isSlideOut = false;
      this.startSlideInAnimation();
      this.updateMobileView();
    }, 200);
  }


  private updateMobileView(): void {
    if (this.isMobileView) {
      this.isContactDetailsVisible = true;
    }
  }

  onBackToList() {
    this.isSlideIn = false;
    this.isSlideOut = true;
    
    setTimeout(() => {
      this.isContactDetailsVisible = false;
      this.selectedContact = null;
      this.isSlideOut = false;
    }, 200); // Match animation duration
  }

  async openNewContactDialog(): Promise<void> {
    const dialogRef = await this.dialogService.openDialog('add');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContacts();
      }
    });
  }

  onContactDeleted() {
    this.selectedContact = null;
    this.isContactDetailsVisible = false;
    this.loadContacts();
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth <= 850;
  }
}
