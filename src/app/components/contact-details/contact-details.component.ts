import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { User } from '../../models/user.class';
import { DialogService } from '../../services/dialog.service';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';

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
  @Output() contactDeleted = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  constructor(
    private dialogService: DialogService, 
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

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
