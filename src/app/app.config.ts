import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// import { __runInitializers } from 'tslib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAuth(() => getAuth()),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyAOf_O8vQ6wvsZA2qomoLj6XiVyJNqi7ME',
        authDomain: 'join-angular-1e63d.firebaseapp.com',
        projectId: 'join-angular-1e63d',
        storageBucket: 'join-angular-1e63d.firebasestorage.app',
        messagingSenderId: '448357385850',
        appId: '1:448357385850:web:ef99d8cd37f571f5e3ddc3',
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
