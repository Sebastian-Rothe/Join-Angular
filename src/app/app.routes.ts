import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { MainContentComponent } from './main-content/main-content.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { SummaryComponent } from './components/summary/summary.component';
import { BoardComponent } from './components/board/board.component';
import { AddTaskComponent } from './components/add-task/add-task.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'main', 
    component: MainContentComponent,
    children: [
      { path: 'contacts', component: ContactsComponent },
      { path: 'summary', component: SummaryComponent },
      { path: 'board', component: BoardComponent },
      { path: 'add-task', component: AddTaskComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
