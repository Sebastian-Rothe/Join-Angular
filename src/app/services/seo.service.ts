import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * SEO Service for managing meta tags and canonical URLs
 * 
 * @description
 * Handles all SEO-related functionality including:
 * - Dynamic meta tag updates
 * - Canonical URL management
 * - Title updates
 * - OpenGraph meta tags
 * - Robots directives
 * 
 * @usageNotes
 * This service automatically updates canonical URLs on route changes
 * and provides methods to update meta tags for specific pages.
 * 
 * @example
 * ```typescript
 * constructor(private seoService: SeoService) {
 *   this.seoService.updateMetaTags({
 *     title: 'Dashboard',
 *     description: 'Join Dashboard Overview'
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class SeoService {
  /**
   * Creates an instance of SeoService.
   * Sets up route change listener for canonical URL updates.
   * 
   * @param meta - Angular's Meta service for managing meta tags
   * @param title - Angular's Title service for managing document title
   * @param router - Angular's Router service for navigation events
   * @param document - DOM document reference for direct manipulation
   */
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCanonicalUrl();
    });
  }

  /**
   * Updates the canonical URL based on current route
   * 
   * @private
   * @description
   * Determines the correct canonical URL for the current route and
   * updates or creates the canonical link tag accordingly.
   * 
   * Routes are mapped as follows:
   * - /legal -> /legal
   * - /privacy -> /privacy
   * - /help -> /help
   * - /main/* -> /main/summary (for protected routes)
   * - / or /login -> /login
   * - /signup -> /signup
   */
  private updateCanonicalUrl(): void {
    const path = this.router.url;
    const baseUrl = 'https://join.sebastian-rothe.com';
    let canonicalUrl = baseUrl;

    switch (true) {
      case path.includes('/main/legal') || path === '/legal':
        canonicalUrl = `${baseUrl}/legal`;
        break;
      case path.includes('/main/privacy') || path === '/privacy':
        canonicalUrl = `${baseUrl}/privacy`;
        break;
      case path.includes('/main/help') || path === '/help':
        canonicalUrl = `${baseUrl}/help`;
        break;
      case path.includes('/main/summary'):
        canonicalUrl = `${baseUrl}/main/summary`;
        break;
      case path === '/login':
      case path === '/':
        canonicalUrl = `${baseUrl}/login`;
        break;
      case path === '/signup':
        canonicalUrl = `${baseUrl}/signup`;
        break;
      case path.includes('/main/greeting'):
        canonicalUrl = `${baseUrl}/main/greeting`;
        break;
      default:
     
        if (path.includes('/main/')) {
          canonicalUrl = `${baseUrl}/main/summary`;
        }
    }

    let canonical = this.document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    } else {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(canonical);
    }
  }

  /**
   * Updates meta tags for SEO optimization
   * 
   * @description
   * Updates various meta tags including:
   * - Page title
   * - Meta description
   * - OpenGraph title and description
   * - Robots directives
   * 
   * @param config - Configuration object for meta tags
   * @param config.title - Page title (will be appended with "| Join")
   * @param config.description - Page description
   * @param config.robots - Robots meta tag content (e.g., "index,follow")
   * 
   * @example
   * ```typescript
   * seoService.updateMetaTags({
   *   title: 'Contact List',
   *   description: 'Manage your contacts efficiently',
   *   robots: 'index,follow'
   * });
   * ```
   */
  updateMetaTags(config: {
    title?: string;
    description?: string;
    robots?: string;
  }): void {
    if (config.title) {
      this.title.setTitle(`${config.title} | Join`);
      this.meta.updateTag({ property: 'og:title', content: `${config.title} | Join` });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }

    if (config.robots) {
      this.meta.updateTag({ name: 'robots', content: config.robots });
    }
  }
}