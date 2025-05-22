import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { DialogService } from '../../services/dialog.service';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';
import { MobileMenuService } from '../../services/mobile-menu.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-mobile-menu-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  styleUrls: ['./mobile-menu-overlay.component.scss'],
  template: `
    <button class="mobile-menu-button" [matMenuTriggerFor]="menu">
      <mat-icon>more_vert</mat-icon>
    </button>

    <mat-menu #menu="matMenu" 
              class="mobile-actions-menu"
              [hasBackdrop]="true"
              [overlapTrigger]="false">
      <button mat-menu-item (click)="handleEdit()">
        <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="handleDelete()">
        <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `
})
export class MobileMenuOverlayComponent {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  private currentContact: User | null = null;

  constructor(
    private dialogService: DialogService,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private mobileMenuService: MobileMenuService
  ) {
    this.mobileMenuService.currentContact$.subscribe(
      contact => this.currentContact = contact
    );
  }

  async handleEdit() {
    if (this.currentContact) {
      const dialogRef = await this.dialogService.openDialog('edit', this.currentContact);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.mobileMenuService.triggerEdit();
        }
      });
    }
  }

  async handleDelete() {
    const uid = this.currentContact?.uid;
    if (!uid) return;

    this.snackbarService.confirm({
      message: 'Are you sure you want to delete this contact?'
    }).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.userService.deleteUser(uid);
          this.snackbarService.success('Contact successfully deleted');
          this.mobileMenuService.triggerDelete();
        } catch (error) {
          this.snackbarService.error('Error deleting contact');
        }
      }
    });
  }

  private closeMenuWithAnimation() {
    const panel = document.querySelector('.mobile-actions-menu');
    if (panel) {
      panel.classList.add('hiding');
      setTimeout(() => {
        this.menuTrigger.closeMenu();
        panel.classList.remove('hiding');
      }, 280);
    }
  }
}
