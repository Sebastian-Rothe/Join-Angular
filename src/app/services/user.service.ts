import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, collection, getDocs, updateDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { Observable, switchMap, map, of } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser$: Observable<User | null>;
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);
  constructor(
    // private authService: AuthService
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

  async updateUserProfilePicture(userId: string, imageFile: File): Promise<void> {
    try {
      const compressedImage = await this.compressImage(imageFile);
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, {
        profilePicture: compressedImage
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  async createUser(userData: {name: string, email: string, phone: string, profilePicture?: string}): Promise<User> {
    try {
      // Get reference to users collection
      const usersCollectionRef = collection(this.firestore, 'users');
      // Generate new document reference with auto-ID
      const newDocRef = doc(usersCollectionRef);
      
      // Create new User instance with the generated ID
      const newUser = new User({
        uid: newDocRef.id,
        ...userData
      });

      // Save to Firestore using the generated reference
      await setDoc(newDocRef, newUser.toPlainObject());
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: {name: string, email: string, phone: string, profilePicture?: string}): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      
      // Update the user document
      await updateDoc(userRef, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profilePicture: userData.profilePicture || ''
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

  public compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject('Could not get canvas context');
            return;
          }

          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject('Error loading image');
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsDataURL(file);
    });
  }
}
