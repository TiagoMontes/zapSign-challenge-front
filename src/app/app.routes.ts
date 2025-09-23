import { Routes } from '@angular/router';
import { authGuard, authMatchGuard } from './core/guards/auth.guard';
import { guestGuard, guestMatchGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestMatchGuard],
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
    title: 'Login - ZapSign',
  },
  {
    path: '',
    canMatch: [authMatchGuard],
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: '/companies',
        pathMatch: 'full',
      },
      {
        path: 'companies',
        loadChildren: () =>
          import('./features/companies/companies.routes').then((m) => m.COMPANIES_ROUTES),
        data: { breadcrumb: 'Empresas' },
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('./features/documents/documents.routes').then((m) => m.DOCUMENTS_ROUTES),
        data: { breadcrumb: 'Documentos' },
      },
      {
        path: 'signers',
        loadChildren: () =>
          import('./features/signers/signers.routes').then((m) => m.SIGNERS_ROUTES),
        data: { breadcrumb: 'Signatários' },
      },
    ],
  },
  {
    path: '**',
    canMatch: [authMatchGuard],
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Página Não Encontrada - ZapSign',
  },
];
