import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'companies',
    loadChildren: () => import('./features/companies/companies.routes').then(m => m.COMPANIES_ROUTES)
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES)
  },
  {
    path: 'signers',
    loadChildren: () => import('./features/signers/signers.routes').then(m => m.SIGNERS_ROUTES)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
