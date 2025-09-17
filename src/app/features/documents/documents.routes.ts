import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/companies',
    pathMatch: 'full'
  },
  {
    path: 'create',
    loadComponent: () => import('./components/document-form/document-form.component').then(m => m.DocumentFormComponent),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Create Document - ZapSign',
    data: { breadcrumb: 'Create Document' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/document-detail/document-detail.component').then(m => m.DocumentDetailComponent),
    title: 'Document Details - ZapSign',
    data: { breadcrumb: 'Document Details' }
  },
  {
    path: ':id/analysis',
    loadComponent: () => import('./components/document-analysis/document-analysis.component').then(m => m.DocumentAnalysisComponent),
    title: 'Document Analysis - ZapSign',
    data: { breadcrumb: 'AI Analysis' }
  },
  {
    path: ':id/sign',
    loadComponent: () => import('./components/document-signing/document-signing.component').then(m => m.DocumentSigningComponent),
    title: 'Document Signing - ZapSign',
    data: { breadcrumb: 'Sign Document' }
  }
];