import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
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

  setCurrentContact(contact: User | null) {
    this.currentContactSource.next(contact);
  }

  triggerEdit() {
    this.editClickSource.next();
  }

  triggerDelete() {
    this.deleteClickSource.next();
  }
}
