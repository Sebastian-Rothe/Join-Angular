import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { User } from '../../models/user.class';
import { DialogService } from '../../services/dialog.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent {
  @Input() contact: User | null = null;
  @Input() isMobileView = false;
  @Output() contactUpdated = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  constructor(private dialogService: DialogService, private userService: UserService) {}

  ngOnInit() {
    // Listen for click outside to close menu with animation
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

  closeMenu() {
    const panel = document.querySelector('.mobile-actions-menu');
    if (panel) {
      panel.classList.add('hiding');
      setTimeout(() => {
        this.menuTrigger.closeMenu();
        panel.classList.remove('hiding');
      }, 280);
    }
  }

  openEditDialog(): void {
    if (this.contact) {
      const dialogRef = this.dialogService.openDialog('edit', this.contact);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.contactUpdated.emit();
        }
      });
    }
  }

  async deleteContact(): Promise<void> {
    if (this.contact?.uid && confirm('Are you sure you want to delete this contact?')) {
      try {
        await this.userService.deleteUser(this.contact.uid);
        this.contactUpdated.emit();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  }
}
