import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SeoService } from './services/seo.service';
import { MobileMenuOverlayComponent } from './components/mobile-menu-overlay/mobile-menu-overlay.component';
import { MobileMenuService } from './services/mobile-menu.service';
import { ContactStateService } from './services/contact-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet, 
    MatIconModule,
    CommonModule,
    MobileMenuOverlayComponent,
  
  ]
})
export class AppComponent implements OnInit {
  title = 'Join-Angular';
  showMobileMenu = false;

  constructor(
    private seoService: SeoService, 
    private router: Router,
    private mobileMenuService: MobileMenuService,
    private contactStateService: ContactStateService
  ) {
    // Route-Change Listener
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkMobileMenuVisibility();
    });

    // Viewport-Change Listener
    window.addEventListener('resize', () => {
      this.checkMobileMenuVisibility();
    });

    this.contactStateService.contactOpened$.subscribe(isOpen => {
      this.showMobileMenu = isOpen && window.innerWidth <= 850;
    });

    window.addEventListener('resize', () => {
      this.contactStateService.contactOpened$.subscribe(isOpen => {
        this.showMobileMenu = isOpen && window.innerWidth <= 850;
      });
    });
  }

  private checkMobileMenuVisibility() {
    
    const isContactDetails = this.router.url.includes('/main/contacts/');
    
    
    const isMobileWidth = window.innerWidth <= 850;
    this.showMobileMenu = isContactDetails && isMobileWidth;
  }

  ngOnInit() {
    // Überwache Route-Änderungen und aktualisiere Meta-Tags
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showMobileMenu = event.url.includes('/contacts/') && window.innerWidth <= 850;

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

    this.mobileMenuService.editClick$.subscribe(() => {
      // Event wird an Contact Details Component weitergeleitet
      this.handleEdit();
    });

    this.mobileMenuService.deleteClick$.subscribe(() => {
      this.handleDelete();
    });
  }

  handleEdit() {
    // Event wird weitergeleitet
  }

  handleDelete() {
    // Event wird weitergeleitet
  }
}
