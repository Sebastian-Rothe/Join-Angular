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
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { Observable, switchMap, map, of, firstValueFrom } from 'rxjs';
import { User } from '../models/user.class';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  currentUser$: Observable<User | null>;
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);
  imageService = inject(ImageService);
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
      const currentUser = await firstValueFrom(this.currentUser$);

      for (const doc of querySnapshot.docs) {
        const userData = doc.data();
        // Delete old guest users that aren't the current user
        if (
          userData['isGuest'] &&
          (!currentUser || doc.id !== currentUser.uid)
        ) {
          await this.deleteUser(doc.id);
          continue;
        }
        users.push(new User(userData));
      }

      return users.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.error('Error updating profile picture:', error);
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
      console.error('Error creating user:', error);
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
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
