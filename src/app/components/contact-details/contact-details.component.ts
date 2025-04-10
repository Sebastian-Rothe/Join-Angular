import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { User } from '../../models/user.class';
import { DialogService } from '../../services/dialog.service';

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
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  constructor(private dialogService: DialogService) {}

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
      this.dialogService.openDialog('edit', this.contact);
    }
  }
}
