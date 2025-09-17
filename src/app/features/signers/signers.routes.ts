import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const SIGNERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/signers-list/signers-list.component').then(m => m.SignersListComponent),
    title: 'Signers - ZapSign',
    data: { breadcrumb: 'All Signers' }
  },
  {
    path: 'create',
    loadComponent: () => import('./components/signer-form/signer-form.component').then(m => m.SignerFormComponent),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Create Signer - ZapSign',
    data: { breadcrumb: 'Create Signer' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/signer-detail/signer-detail.component').then(m => m.SignerDetailComponent),
    title: 'Signer Details - ZapSign',
    data: { breadcrumb: 'Signer Details' }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/signer-form/signer-form.component').then(m => m.SignerFormComponent),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Edit Signer - ZapSign',
    data: { breadcrumb: 'Edit Signer' }
  }
];