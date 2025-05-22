import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class ContactStateService {
  private contactOpenedSource = new BehaviorSubject<boolean>(false);
  contactOpened$ = this.contactOpenedSource.asObservable();

  private currentContactSource = new BehaviorSubject<User | null>(null);
  currentContact$ = this.currentContactSource.asObservable();

  setContactOpened(isOpen: boolean, contact: User | null = null) {
    this.contactOpenedSource.next(isOpen);
    this.currentContactSource.next(contact);
  }
}
