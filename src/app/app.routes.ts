import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - ZapSign',
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'companies',
        loadChildren: () => import('./features/companies/companies.routes').then(m => m.COMPANIES_ROUTES),
        data: { breadcrumb: 'Companies' }
      },
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES),
        data: { breadcrumb: 'Documents' }
      },
      {
        path: 'signers',
        loadChildren: () => import('./features/signers/signers.routes').then(m => m.SIGNERS_ROUTES),
        data: { breadcrumb: 'Signers' }
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - ZapSign'
  }
];
