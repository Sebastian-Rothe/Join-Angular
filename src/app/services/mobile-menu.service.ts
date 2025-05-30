import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
// Services
import { DialogService } from './dialog.service';
import { SnackbarService } from './snackbar.service';
import { UserService } from './user.service';
// Models
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class MobileMenuService {
  private currentContactSource = new BehaviorSubject<User | null>(null);
  currentContact$ = this.currentContactSource.asObservable();

  private editClickSource = new Subject<void>();
  private deleteClickSource = new Subject<void>();

  editClick$ = this.editClickSource.asObservable();
  deleteClick$ = this.deleteClickSource.asObservable();

  constructor(
    private dialogService: DialogService,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  setCurrentContact(contact: User | null) {
    this.currentContactSource.next(contact);
  }

  async handleEdit() {
    const contact = this.currentContactSource.getValue();
    if (contact) {
      const dialogRef = await this.dialogService.openDialog('edit', contact);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.editClickSource.next();
        }
      });
    }
  }

  async handleDelete() {
    const contact = this.currentContactSource.getValue();
    const uid = contact?.uid;
    if (!uid) return;

    this.snackbarService.confirm({
      message: 'Are you sure you want to delete this contact?'
    }).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.userService.deleteUser(uid);
          this.snackbarService.success('Contact successfully deleted');
          this.deleteClickSource.next();
        } catch (error) {
          this.snackbarService.error('Error deleting contact');
        }
      }
    });
  }
}
