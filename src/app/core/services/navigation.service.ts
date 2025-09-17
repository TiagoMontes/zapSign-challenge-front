import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';

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
  providedIn: 'root'
})
export class NavigationService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  private currentRouteSubject = new BehaviorSubject<string>('');

  breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  currentRoute$ = this.currentRouteSubject.asObservable();

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute
  ) {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
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
      ...(fragment && { fragment })
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
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        active: this.isRouteActive('/dashboard')
      },
      {
        label: 'Companies',
        icon: 'business',
        route: '/companies',
        active: this.isRouteActive('/companies'),
        children: [
          {
            label: 'All Companies',
            icon: 'list',
            route: '/companies',
            active: currentRoute === '/companies'
          },
          {
            label: 'Create Company',
            icon: 'add',
            route: '/companies/create',
            active: currentRoute === '/companies/create'
          }
        ]
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
   * Document navigation helpers
   */
  navigateToDocuments(): Promise<boolean> {
    return this.navigateTo('/documents');
  }

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
   * Signer navigation helpers
   */
  navigateToSigners(): Promise<boolean> {
    return this.navigateTo('/signers');
  }

  navigateToSigner(id: string): Promise<boolean> {
    return this.navigateTo(['/signers', id]);
  }

  navigateToCreateSigner(): Promise<boolean> {
    return this.navigateTo('/signers/create');
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
        label: 'Dashboard',
        url: '/dashboard',
        active: false
      });

      // Build breadcrumbs from route hierarchy
      while (currentRoute.children.length > 0) {
        currentRoute = currentRoute.children[0];

        if (currentRoute.snapshot?.url?.length > 0) {
          url += '/' + currentRoute.snapshot.url.map(segment => segment.path).join('/');

          const routeData = currentRoute.snapshot.data;
          const breadcrumbLabel = routeData['breadcrumb'];

          if (breadcrumbLabel) {
            breadcrumbs.push({
              label: breadcrumbLabel,
              url: url,
              active: false
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
      this.breadcrumbsSubject.next([{
        label: 'Dashboard',
        url: '/dashboard',
        active: true
      }]);
    }
  }

  /**
   * Update breadcrumbs based on current route (legacy method)
   */
  private updateBreadcrumbs(url: string): void {
    const urlSegments = url.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always add dashboard as home
    breadcrumbs.push({
      label: 'Dashboard',
      url: '/dashboard',
      active: false
    });

    let currentUrl = '';

    for (let i = 0; i < urlSegments.length; i++) {
      const segment = urlSegments[i];
      currentUrl += '/' + segment;
      const isLast = i === urlSegments.length - 1;

      const label = this.getSegmentLabel(segment, urlSegments, i);

      breadcrumbs.push({
        label,
        url: currentUrl,
        active: isLast
      });
    }

    this.breadcrumbsSubject.next(breadcrumbs);
  }

  /**
   * Get human-readable label for route segment
   */
  private getSegmentLabel(segment: string, allSegments: string[], index: number): string {
    // Check if it's a known route segment
    const routeLabels: Record<string, string> = {
      'companies': 'Companies',
      'documents': 'Documents',
      'signers': 'Signers',
      'dashboard': 'Dashboard',
      'create': 'Create',
      'edit': 'Edit',
      'analysis': 'Analysis',
      'sign': 'Sign'
    };

    if (routeLabels[segment]) {
      return routeLabels[segment];
    }

    // Check if it's an ID parameter (UUID-like format)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(segment) || /^\d+$/.test(segment)) {
      // Try to determine the type based on the parent segment
      const parentSegment = allSegments[index - 1];
      if (parentSegment === 'companies') {
        return 'Company Details';
      } else if (parentSegment === 'documents') {
        return 'Document Details';
      } else if (parentSegment === 'signers') {
        return 'Signer Details';
      }
      return 'Details';
    }

    // Fallback: capitalize the segment
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

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
    const updated = current.map(b => ({ ...b, active: false }));
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