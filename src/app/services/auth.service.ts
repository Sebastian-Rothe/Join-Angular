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
import { SnackbarService } from './snackbar.service';

/**
 * Authentication service that handles user authentication, registration, and management
 * using Firebase Authentication and Firestore.
 * 
 * @class AuthService
 * @description Manages all authentication-related operations including login, registration,
 * guest access, and user document management in Firestore.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Observable that emits the current authentication state of the user
   * @type {Observable<any>}
   */
  user$: Observable<any>;

  /**
   * Firebase Firestore instance
   * @type {Firestore}
   */
  firestore: Firestore = inject(Firestore);

  /**
   * Firebase Auth instance
   * @type {Auth}
   */
  auth = inject(Auth);

  constructor(private snackbarService: SnackbarService) {
    this.user$ = user(this.auth);
  }

  /**
   * Authenticates a user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{user: any, userData: any}>} Object containing user credentials and user data
   * @throws {Error} If login fails or user data is not found
   */
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (!userCredential.user) {
        throw { code: 'auth/no-user-data' };
      }
      const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        throw { code: 'auth/no-user-data' };
      }

      return { user: userCredential.user, userData: userDoc.data() };

    } catch (error: any) {
      this.snackbarService.error('Login failed. Please check your credentials');
      throw error;
    }
  }

  /**
   * Registers a new user with email and password
   * 
   * @param {string} email - New user's email address
   * @param {string} password - New user's password
   * @returns {Promise<any>} Firebase user credential
   * @throws {Error} If registration fails
   */
  async register(email: string, password: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      this.snackbarService.error('Registration failed. Please try again.');
      throw error;
    }
  }

  /**
   * Creates or updates a user document in Firestore
   * 
   * @param {string} userId - User's unique identifier
   * @param {User} userData - User data to be stored
   * @returns {Promise<void>}
   */
  async createUserDocument(userId: string, userData: User) {
    const userRef = doc(this.firestore, 'users', userId);
    await setDoc(userRef, userData.toPlainObject());
  }

  /**
   * Creates an anonymous guest user account
   * 
   * @returns {Promise<any>} Firebase user credential for guest
   * @throws {Error} If guest login is disabled or fails
   */
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
        this.snackbarService.error(
          'Guest login is not enabled. Please contact administrator.'
        );
        throw error;
      }
      this.snackbarService.error('Guest login failed. Please try again.');
      throw error;
    }
  }

  /**
   * Creates a Firestore document for a guest user
   * 
   * @private
   * @param {string} userId - Guest user's unique identifier
   * @returns {Promise<void>}
   */
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

  /**
   * Signs out the current user and performs cleanup
   * For guest users, deletes their Firestore document
   * 
   * @returns {Promise<void>}
   * @throws {Error} If logout fails
   */
  async logout() {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser?.isAnonymous) {
        // Using isAnonymous instead of checking document
        await deleteDoc(doc(this.firestore, 'users', currentUser.uid));
      }
      await signOut(this.auth);
    } catch (error) {
      this.snackbarService.error('Error logging out. Please try again.');
      throw error;
    }
  }
}
