import { Routes } from '@angular/router';

export const SIGNERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/companies',
    pathMatch: 'full',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/signer-detail/signer-detail.component').then(
        (m) => m.SignerDetailComponent,
      ),
    title: 'Signer Details - ZapSign',
    data: { breadcrumb: 'Signer Details' },
  },
];
