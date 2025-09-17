import { Routes } from '@angular/router';

export const SIGNERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/signers-list/signers-list.component').then(m => m.SignersListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/signer-form/signer-form.component').then(m => m.SignerFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/signer-detail/signer-detail.component').then(m => m.SignerDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/signer-form/signer-form.component').then(m => m.SignerFormComponent)
  }
];