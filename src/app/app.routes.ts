import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { MainContentComponent } from './main-content/main-content.component';
import { ContactsComponent } from './components/contacts/contacts.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'main', 
    component: MainContentComponent,
    children: [
      { path: 'contacts', component: ContactsComponent },
      // Add more child routes here as needed
    ]
  },
  { path: '**', redirectTo: '/login' } // Wildcard route für nicht-existierende Routen
];
