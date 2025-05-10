import { Injectable, inject } from '@angular/core';
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
// import {
//   getStorage,
//   ref,
//   uploadString,
//   getDownloadURL,
// } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { Observable, switchMap, map, of, firstValueFrom } from 'rxjs';
import { User } from '../models/user.class';
import { ImageService } from './image.service';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  currentUser$: Observable<User | null>;
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);
  imageService = inject(ImageService);
  private snackbar = inject(SnackbarService);

  constructor() {
    // User-Stream erstellen, der sich automatisch bei Auth-Änderungen aktualisiert
    this.currentUser$ = this.authService.user$.pipe(
      switchMap(async (authUser) => {
        if (!authUser) return null;

        try {
          const userDoc = await getDoc(
            doc(this.firestore, 'users', authUser.uid)
          );
          if (userDoc.exists()) {
            // Konvertiere Firestore-Daten in User-Objekt
            return new User(userDoc.data());
          }
          return null;
        } catch (error) {
          this.snackbar.error('Error fetching user data. Please try again.');
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
      this.snackbar.error('Error fetching user data. Please try again.');
      return null;
    }
  }

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
      this.snackbar.error(
        'Error during guest users cleanup. Please try again.'
      );
    }
  }

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
      this.snackbar.error('Error fetching users. Please try again.');
      return [];
    }
  }

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
      this.snackbar.error('Error updating profile picture. Please try again.');
      throw error;
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
  }): Promise<User> {
    try {
      // Get reference to users collection
      const usersCollectionRef = collection(this.firestore, 'users');
      // Generate new document reference with auto-ID
      const newDocRef = doc(usersCollectionRef);

      // Create new User instance with the generated ID
      const newUser = new User({
        uid: newDocRef.id,
        ...userData,
      });

      // Save to Firestore using the generated reference
      await setDoc(newDocRef, newUser.toPlainObject());

      return newUser;
    } catch (error) {
      this.snackbar.error('Error creating user. Please try again.');
      throw error;
    }
  }

  async updateUser(
    userId: string,
    userData: {
      name: string;
      email: string;
      phone: string;
      profilePicture?: string;
    }
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);

      // Update the user document
      await updateDoc(userRef, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profilePicture: userData.profilePicture || '',
      });
    } catch (error) {
      this.snackbar.error('Error updating user. Please try again.');
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      this.snackbar.error('Error deleting user. Please try again.');
      throw error;
    }
  }
}
