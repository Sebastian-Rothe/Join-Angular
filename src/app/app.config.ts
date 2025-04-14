import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ActionDialogComponent } from './components/action-dialog/action-dialog.component';
import { setLogLevel, LogLevel } from '@angular/fire';

setLogLevel(LogLevel.SILENT);  // oder LogLevel.WARN für weniger verbose Warnungen

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
    provideHttpClient(),
    provideNativeDateAdapter(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};

export const appComponents = {
  bootstrap: [ActionDialogComponent]
};
