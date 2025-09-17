import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/documents-list/documents-list.component').then(m => m.DocumentsListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/document-form/document-form.component').then(m => m.DocumentFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/document-detail/document-detail.component').then(m => m.DocumentDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/document-form/document-form.component').then(m => m.DocumentFormComponent)
  },
  {
    path: ':id/sign',
    loadComponent: () => import('./components/document-signing/document-signing.component').then(m => m.DocumentSigningComponent)
  }
];