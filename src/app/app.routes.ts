import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { MainContentComponent } from './main-content/main-content.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { SummaryComponent } from './components/summary/summary.component';
import { BoardComponent } from './components/board/board.component';
import { AddTaskComponent } from './components/add-task/add-task.component';
import { AuthGuard } from './guards/auth.guard';
import { HelpComponent } from './components/help/help.component';
import { GreetingOverlayComponent } from './components/greeting-overlay/greeting-overlay.component';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'legal', component: LegalNoticeComponent },
  {path: 'privacy', component: PrivacyPolicyComponent}, 
  {
    path: 'main',
    component: MainContentComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'greeting', pathMatch: 'full' },
      { path: 'greeting', component: GreetingOverlayComponent },
      { path: 'summary', component: SummaryComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'board', component: BoardComponent },
      { path: 'add-task', component: AddTaskComponent },
      { path: 'help', component: HelpComponent },
      { path: 'legal', component: LegalNoticeComponent },
      {path: 'privacy', component: PrivacyPolicyComponent}, 
    ],
  },
  { path: '**', redirectTo: '/login' },
];
