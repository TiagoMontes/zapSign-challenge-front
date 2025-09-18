import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const SIGNERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/companies',
    pathMatch: 'full'
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