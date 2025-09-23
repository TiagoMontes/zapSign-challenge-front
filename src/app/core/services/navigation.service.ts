import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
  expanded?: boolean;
  children?: NavigationItem[];
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  private currentRouteSubject = new BehaviorSubject<string>('');

  breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  currentRoute$ = this.currentRouteSubject.asObservable();

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
  ) {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    // Track route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRouteSubject.next(event.url);
        this.updateBreadcrumbsFromRoute();
      });

    // Set initial values after router is ready
    setTimeout(() => {
      if (this.router.url) {
        this.currentRouteSubject.next(this.router.url);
        this.updateBreadcrumbsFromRoute();
      }
    });
  }

  /**
   * Navigate to a specific route
   */
  navigateTo(route: string | string[], queryParams?: any, fragment?: string): Promise<boolean> {
    const navigationExtras = {
      ...(queryParams && { queryParams }),
      ...(fragment && { fragment }),
    };

    if (Array.isArray(route)) {
      return this.router.navigate(route, navigationExtras);
    }
    return this.router.navigate([route], navigationExtras);
  }

  /**
   * Navigate back in history
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Navigate forward in history
   */
  goForward(): void {
    this.location.forward();
  }

  /**
   * Check if a route is currently active
   */
  isRouteActive(route: string): boolean {
    const currentUrl = this.currentRouteSubject.value;
    if (route === '/' && currentUrl === '/') {
      return true;
    }
    return currentUrl === route || currentUrl.startsWith(route + '/');
  }

  /**
   * Get navigation items with active states
   */
  getNavigationItems(): NavigationItem[] {
    const currentRoute = this.currentRouteSubject.value;

    return [
      {
        label: 'Painel',
        icon: 'dashboard',
        route: '/dashboard',
        active: this.isRouteActive('/dashboard'),
      },
      {
        label: 'Empresas',
        icon: 'business',
        route: '/companies',
        active: this.isRouteActive('/companies'),
        children: [
          {
            label: 'Todas as Empresas',
            icon: 'list',
            route: '/companies',
            active: currentRoute === '/companies',
          },
          {
            label: 'Criar Empresa',
            icon: 'add',
            route: '/companies/create',
            active: currentRoute === '/companies/create',
          },
        ],
      },
    ];
  }

  /**
   * Company navigation helpers
   */
  navigateToCompanies(): Promise<boolean> {
    return this.navigateTo('/companies');
  }

  navigateToCompany(id: string): Promise<boolean> {
    return this.navigateTo(['/companies', id]);
  }

  navigateToCreateCompany(): Promise<boolean> {
    return this.navigateTo('/companies/create');
  }

  navigateToEditCompany(id: string): Promise<boolean> {
    return this.navigateTo(['/companies', id, 'edit']);
  }

  navigateToCompanyDocuments(id: string): Promise<boolean> {
    return this.navigateTo(['/companies', id, 'documents']);
  }

  /**
   * Document navigation helpers (always through company context)
   */
  navigateToDocument(id: string): Promise<boolean> {
    return this.navigateTo(['/documents', id]);
  }

  navigateToCreateDocument(companyId?: string): Promise<boolean> {
    const queryParams = companyId ? { companyId } : undefined;
    return this.navigateTo('/documents/create', queryParams);
  }

  navigateToDocumentAnalysis(id: string): Promise<boolean> {
    return this.navigateTo(['/documents', id, 'analysis']);
  }

  navigateToDocumentSigning(id: string): Promise<boolean> {
    return this.navigateTo(['/documents', id, 'sign']);
  }

  /**
   * Signer navigation helpers (only for detail/edit views)
   */
  navigateToSigner(id: string): Promise<boolean> {
    return this.navigateTo(['/signers', id]);
  }

  navigateToEditSigner(id: string): Promise<boolean> {
    return this.navigateTo(['/signers', id, 'edit']);
  }

  /**
   * Update breadcrumbs from route data
   */
  private updateBreadcrumbsFromRoute(): void {
    try {
      const breadcrumbs: BreadcrumbItem[] = [];
      let currentRoute = this.activatedRoute.root;
      let url = '';

      // Check if router and route are properly initialized
      if (!this.router.url || !currentRoute) {
        return;
      }

      // Always add dashboard as home
      breadcrumbs.push({
        label: 'Painel',
        url: '/dashboard',
        active: false,
      });

      // Build breadcrumbs from route hierarchy
      while (currentRoute.children.length > 0) {
        currentRoute = currentRoute.children[0];

        if (currentRoute.snapshot?.url?.length > 0) {
          url += '/' + currentRoute.snapshot.url.map((segment) => segment.path).join('/');

          const routeData = currentRoute.snapshot.data;
          const breadcrumbLabel = routeData['breadcrumb'];

          if (breadcrumbLabel) {
            breadcrumbs.push({
              label: breadcrumbLabel,
              url: url,
              active: false,
            });
          }
        }
      }

      // Mark the last breadcrumb as active
      if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].active = true;
      }

      this.breadcrumbsSubject.next(breadcrumbs);
    } catch (error) {
      console.warn('Error updating breadcrumbs:', error);
      // Fallback to basic breadcrumb
      this.breadcrumbsSubject.next([
        {
          label: 'Dashboard',
          url: '/dashboard',
          active: true,
        },
      ]);
    }
  }

  // Legacy breadcrumb method removed (not used)

  // Removed legacy segment label helper (not used)

  /**
   * Set custom breadcrumbs (useful for dynamic content)
   */
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  /**
   * Add breadcrumb item
   */
  addBreadcrumb(item: BreadcrumbItem): void {
    const current = this.breadcrumbsSubject.value;
    // Set all existing items as inactive
    const updated = current.map((b) => ({ ...b, active: false }));
    updated.push(item);
    this.breadcrumbsSubject.next(updated);
  }

  /**
   * Get current route parameters
   */
  getRouteParams(): Observable<any> {
    return this.activatedRoute.params;
  }

  /**
   * Get current query parameters
   */
  getQueryParams(): Observable<any> {
    return this.activatedRoute.queryParams;
  }

  /**
   * Check if user can navigate back
   */
  canGoBack(): boolean {
    return window.history.length > 1;
  }
}
