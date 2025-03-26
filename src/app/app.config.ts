import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAOf_O8vQ6wvsZA2qomoLj6XiVyJNqi7ME",
  authDomain: "join-angular-1e63d.firebaseapp.com",
  projectId: "join-angular-1e63d",
  storageBucket: "join-angular-1e63d",
  messagingSenderId: "448357385850",
  appId: "1:448357385850:web:ef99d8cd37f571f5e3ddc3"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
