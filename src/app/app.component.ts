import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, MatIconModule]
})
export class AppComponent implements OnInit {
  title = 'Join-Angular';

  constructor(private seoService: SeoService, private router: Router) {}

  ngOnInit() {
    // Überwache Route-Änderungen und aktualisiere Meta-Tags
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.url;
      
      // Konfiguriere Meta-Tags basierend auf der aktuellen Route
      let config: { title: string; description: string; robots?: string } = {
        title: 'Join - Kanban Project Management Tool',
        description: 'Join is a powerful Kanban project management tool that helps teams organize and track tasks efficiently.'
      };

      switch(true) {
        case currentRoute.includes('/board'):
          config = {
            title: 'Board',
            description: 'Organize and track your tasks with our intuitive Kanban board view.'
          };
          break;
        case currentRoute.includes('/contacts'):
          config = {
            title: 'Contacts',
            description: 'Manage your team contacts and collaborate effectively with your project members.'
          };
          break;
        case currentRoute.includes('/summary'):
          config = {
            title: 'Summary',
            description: 'Get an overview of your project progress and task distribution.'
          };
          break;
        case currentRoute.includes('/add-task'):
          config = {
            title: 'Add Task',
            description: 'Create new tasks and assign them to team members.'
          };
          break;
        case currentRoute.includes('/login'):          config = {
            title: 'Login',
            description: 'Sign in to your Join account to manage your tasks and projects.',
            robots: 'index, follow'  // Änderung zu index, follow
          };
          break;
        case currentRoute.includes('/signup'):
          config = {
            title: 'Sign Up',
            description: 'Create a new Join account and start managing your projects efficiently.',
            robots: 'index, follow'  // Änderung zu index, follow
          };
          break;
        case currentRoute.includes('/legal'):
          config = {
            title: 'Legal Notice',
            description: 'Legal information and terms of service for Join.'
          };
          break;
        case currentRoute.includes('/privacy'):
          config = {
            title: 'Privacy Policy',
            description: 'Learn about how we handle and protect your data.'
          };
          break;
      }

      this.seoService.updateMetaTags(config);
    });
  }
}
