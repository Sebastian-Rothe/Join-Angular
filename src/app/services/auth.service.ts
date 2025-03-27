import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.user$ = user(this.auth);
  }

  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async register(email: string, password: string, userName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Create user document in Firestore
      await this.createUserDocument(userCredential.user.uid, {
        userName: userName,
        email: email
      });
      
      return userCredential;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  private async createUserDocument(userId: string, userData: { userName: string, email: string }) {
    const userRef = doc(this.firestore, 'users', userId);
    await setDoc(userRef, userData);
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
}
