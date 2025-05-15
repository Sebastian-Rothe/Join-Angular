import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Update canonical URL on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCanonicalUrl();
    });
  }

  private updateCanonicalUrl(): void {
    const path = this.router.url;
    const baseUrl = 'https://join.sebastian-rothe.com';
    let canonicalUrl = baseUrl;

    // Bestimme die korrekte kanonische URL basierend auf der aktuellen Route
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
        // Für geschützte oder nicht aufgelistete Routen
        if (path.includes('/main/')) {
          canonicalUrl = `${baseUrl}/main/summary`;
        }
    }

    // Aktualisiere oder erstelle canonical tag
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
   * Updates meta tags for a specific page
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