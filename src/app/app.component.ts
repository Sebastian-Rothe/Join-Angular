import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
// Services
import { SeoService } from './services/seo.service';
import { ContactStateService } from './services/contact-state.service';
// Shared Components
import { MobileMenuOverlayComponent } from './shared/components/mobile-menu-overlay/mobile-menu-overlay.component';

/**
 * @class AppComponent
 * @description Root component of the Join application. Handles routing, mobile menu visibility,
 * and SEO meta tag updates based on route changes.
 * @implements {OnInit}
 */
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
  ],
})
export class AppComponent implements OnInit {
  /** @property {string} title - The title of the application */
  title = 'Join-Angular';

  /** @property {boolean} showMobileMenu - Controls the visibility of the mobile menu overlay */
  showMobileMenu = false;

  /**
   * @constructor
   * @param {SeoService} seoService - Service for managing SEO meta tags
   * @param {Router} router - Angular router service for navigation
   * @param {ContactStateService} contactStateService - Service for managing contact view state
   */
  constructor(
    private seoService: SeoService,
    private router: Router,
    private contactStateService: ContactStateService
  ) {
    // Route-Change Listener
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkMobileMenuVisibility();
      });

    this.contactStateService.contactOpened$.subscribe((isOpen) => {
      this.showMobileMenu = isOpen && window.innerWidth <= 850;
    });
  }

  /**
   * @method onResize
   * @description Window resize event handler that updates mobile menu visibility
   * and contact state based on window width
   * @decorators @HostListener('window:resize')
   */
  @HostListener('window:resize')
  onResize() {
    this.checkMobileMenuVisibility();
    this.contactStateService.contactOpened$.subscribe((isOpen) => {
      this.showMobileMenu = isOpen && window.innerWidth <= 850;
    });
  }

  /**
   * @private
   * @method checkMobileMenuVisibility
   * @description Determines if the mobile menu should be visible based on current route and window width
   */
  private checkMobileMenuVisibility() {
    const isContactDetails = this.router.url.includes('/main/contacts/');

    const isMobileWidth = window.innerWidth <= 850;
    this.showMobileMenu = isContactDetails && isMobileWidth;
  }

  /**
   * @method ngOnInit
   * @description Lifecycle hook that initializes route change subscription and meta tag updates.
   * Updates meta tags and title based on current route for SEO optimization.
   * @implements OnInit
   */
  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showMobileMenu =
          event.url.includes('/contacts/') && window.innerWidth <= 850;

        const currentRoute = this.router.url;

        let config: { title: string; description: string; robots?: string } = {
          title: 'Join - Kanban Project Management Tool',
          description:
            'Join is a powerful Kanban project management tool that helps teams organize and track tasks efficiently.',
        };

        switch (true) {
          case currentRoute.includes('/board'):
            config = {
              title: 'Board',
              description:
                'Organize and track your tasks with our intuitive Kanban board view.',
            };
            break;
          case currentRoute.includes('/contacts'):
            config = {
              title: 'Contacts',
              description:
                'Manage your team contacts and collaborate effectively with your project members.',
            };
            break;
          case currentRoute.includes('/summary'):
            config = {
              title: 'Summary',
              description:
                'Get an overview of your project progress and task distribution.',
            };
            break;
          case currentRoute.includes('/add-task'):
            config = {
              title: 'Add Task',
              description: 'Create new tasks and assign them to team members.',
            };
            break;
          case currentRoute.includes('/login'):
            config = {
              title: 'Login',
              description:
                'Sign in to your Join account to manage your tasks and projects.',
              robots: 'index, follow',
            };
            break;
          case currentRoute.includes('/signup'):
            config = {
              title: 'Sign Up',
              description:
                'Create a new Join account and start managing your projects efficiently.',
              robots: 'index, follow',
            };
            break;
          case currentRoute.includes('/legal'):
            config = {
              title: 'Legal Notice',
              description: 'Legal information and terms of service for Join.',
            };
            break;
          case currentRoute.includes('/privacy'):
            config = {
              title: 'Privacy Policy',
              description: 'Learn about how we handle and protect your data.',
            };
            break;
        }

        this.seoService.updateMetaTags(config);
      });
  }
}
