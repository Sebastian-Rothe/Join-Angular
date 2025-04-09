import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  isContactDetailsVisible = false;
  isMobileView = false;
  contacts: User[] = [];
  groupedContacts: { [key: string]: User[] } = {};
  selectedContact: User | null = null;

  constructor(private userService: UserService) {}

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
    this.selectedContact = contact;
    if (this.isMobileView) {
      this.isContactDetailsVisible = true;
    }
  }

  onBackToList() {
    this.isContactDetailsVisible = false;
  }

  openNewContactDialog() {
    // Implement dialog opening logic
  }
}