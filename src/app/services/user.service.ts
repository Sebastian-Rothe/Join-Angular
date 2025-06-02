import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, map, of, firstValueFrom } from 'rxjs';
// Angular Fire imports for Firebase Firestore
import {
  Firestore,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
// Services
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';
// Models
import { User } from '../models/user.class';
import { ImageService } from './image.service';

/**
 * Interface for user data manipulation
 */
interface UserData {
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
}

/**
 * Service for managing user data in the application
 *
 * @class UserService
 * @description Handles all user-related operations including authentication state management,
 * user CRUD operations, and guest user cleanup in Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * Observable stream of the currently authenticated user
   * @type {Observable<User | null>}
   */
  currentUser$: Observable<User | null>;
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);
  imageService = inject(ImageService);
  private snackbarService = inject(SnackbarService);

  /**
   * Initializes the service and sets up the current user stream
   * @constructor
   */
  constructor() {
    this.currentUser$ = this.authService.user$.pipe(
      switchMap(async (authUser) => {
        if (!authUser) return null;

        try {
          const userDoc = await getDoc(
            doc(this.firestore, 'users', authUser.uid)
          );
          if (userDoc.exists()) {
            return new User(userDoc.data());
          }
          return null;
        } catch (error) {
          this.snackbarService.error(
            'Error fetching user data. Please try again.'
          );
          return null;
        }
      })
    );
  }

  /**
   * Retrieves a user by their unique identifier
   *
   * @param {string} userId - The unique identifier of the user to retrieve
   * @returns {Promise<User | null>} The user object if found, null otherwise
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (userDoc.exists()) {
        return new User(userDoc.data());
      }
      return null;
    } catch (error) {
      this.snackbarService.error('Error fetching user data. Please try again.');
      return null;
    }
  }

  /**
   * Removes all guest user accounts except the current user
   *
   * @returns {Promise<void>}
   */
  async cleanupGuestUsers(): Promise<void> {
    try {
      const currentUser = await firstValueFrom(this.currentUser$);
      if (!currentUser) return;

      const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
      const deletePromises = usersSnapshot.docs
        .filter((doc) => {
          const userData = doc.data();
          return userData['isGuest'] && doc.id !== currentUser.uid;
        })
        .map((doc) => this.deleteUser(doc.id));

      await Promise.all(deletePromises);
    } catch (error) {
      this.snackbarService.error(
        'Error during guest users cleanup. Please try again.'
      );
    }
  }

  /**
   * Retrieves all active users, excluding guest accounts
   *
   * @returns {Promise<User[]>} Array of active users sorted by name
   */
  async getAllUsers(): Promise<User[]> {
    try {
      await this.cleanupGuestUsers();
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      const currentUser = await firstValueFrom(this.currentUser$);

      return querySnapshot.docs
        .map((doc) => new User({ ...doc.data(), uid: doc.id }))
        .filter((user) => {
          return (
            (!user.isGuest && !user.email.includes('guest@temporary.com')) ||
            (currentUser && user.uid === currentUser.uid)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.snackbarService.error('Error fetching users. Please try again.');
      return [];
    }
  }

  /**
   * Updates a user's profile picture
   *
   * @param {string} userId - The ID of the user to update
   * @param {File} imageFile - The new profile picture file
   * @returns {Promise<void>}
   * @throws {Error} If the update fails
   */
  async updateUserProfilePicture(
    userId: string,
    imageFile: File
  ): Promise<void> {
    try {
      const compressedImage = await this.imageService.compressImage(imageFile);
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, {
        profilePicture: compressedImage,
      });
    } catch (error) {
      this.snackbarService.error(
        'Error updating profile picture. Please try again.'
      );
      throw error;
    }
  }

  /**
   * Creates a new user in the system
   *
   * @param {UserData} userData - The user data for creation
   * @returns {Promise<User>} The newly created user
   * @throws {Error} If user creation fails
   */
  async createUser(userData: UserData): Promise<User> {
    try {
      const usersCollectionRef = collection(this.firestore, 'users');
      const newDocRef = doc(usersCollectionRef);

      const newUser = new User({
        uid: newDocRef.id,
        ...userData,
      });

      await setDoc(newDocRef, newUser.toPlainObject());

      return newUser;
    } catch (error) {
      this.snackbarService.error('Error creating user. Please try again.');
      throw error;
    }
  }

  /**
   * Updates an existing user's information
   *
   * @param {string} userId - The ID of the user to update
   * @param {UserData} userData - The updated user data
   * @returns {Promise<void>}
   * @throws {Error} If the update fails
   */
  async updateUser(userId: string, userData: UserData): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);

      await updateDoc(userRef, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profilePicture: userData.profilePicture || '',
      });
    } catch (error) {
      this.snackbarService.error('Error updating user. Please try again.');
      throw error;
    }
  }

  /**
   * Deletes a user from the system
   *
   * @param {string} userId - The ID of the user to delete
   * @returns {Promise<void>}
   * @throws {Error} If the deletion fails
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      this.snackbarService.error('Error deleting user. Please try again.');
      throw error;
    }
  }
}
