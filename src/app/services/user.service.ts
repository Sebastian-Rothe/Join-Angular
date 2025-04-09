import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, switchMap, map, of } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser$: Observable<User | null>;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    // User-Stream erstellen, der sich automatisch bei Auth-Änderungen aktualisiert
    this.currentUser$ = this.authService.user$.pipe(
      switchMap(async (authUser) => {
        if (!authUser) return null;
        
        try {
          const userDoc = await getDoc(doc(this.firestore, 'users', authUser.uid));
          if (userDoc.exists()) {
            // Konvertiere Firestore-Daten in User-Objekt
            return new User(userDoc.data());
          }
          return null;
        } catch (error) {
          console.error('Error fetching user data:', error);
          return null;
        }
      })
    );
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (userDoc.exists()) {
        return new User(userDoc.data());
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push(new User(doc.data()));
      });
      return users.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}
