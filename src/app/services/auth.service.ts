import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  signInAnonymously,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;
  firestore: Firestore = inject(Firestore);
  auth = inject(Auth);
  constructor() {
    this.user$ = user(this.auth);
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      if (userCredential.user) {
        const userDoc = await getDoc(
          doc(this.firestore, 'users', userCredential.user.uid)
        );
        if (userDoc.exists()) {
          return {
            user: userCredential.user,
            userData: userDoc.data(),
          };
        }
      }
      throw new Error('User data not found');
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async createUserDocument(userId: string, userData: User) {
    const userRef = doc(this.firestore, 'users', userId);
    await setDoc(userRef, userData.toPlainObject());
  }

  async guestLogin(): Promise<any> {
    try {
      const userCredential = await signInAnonymously(this.auth);
      if (userCredential.user) {
        await this.createGuestDocument(userCredential.user.uid);
        return userCredential.user;
      }
      throw new Error('Guest login failed');
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        throw new Error(
          'Guest login is not enabled. Please contact administrator.'
        );
      }
      console.error('Guest login failed:', error);
      throw error;
    }
  }

  private async createGuestDocument(userId: string) {
    const guestUser = new User({
      uid: userId,
      name: 'Guest User',
      email: 'guest@temporary.com',
      phone: '',
      profilePicture: '',
      initials: 'GU',
      isGuest: true,
    });
    await this.createUserDocument(userId, guestUser);
  }

  async logout() {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser?.isAnonymous) {
        // Using isAnonymous instead of checking document
        await deleteDoc(doc(this.firestore, 'users', currentUser.uid));
      }
      await signOut(this.auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
}
