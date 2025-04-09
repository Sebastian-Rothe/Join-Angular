import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

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
  selectedContact: any = null;

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth <= 850;
  }

  onContactSelect(contact: any) {
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