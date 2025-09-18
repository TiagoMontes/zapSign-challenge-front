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
    title: 'Criar Documento - ZapSign',
    data: { breadcrumb: 'Criar Documento' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/document-detail/document-detail.component').then(m => m.DocumentDetailComponent),
    title: 'Detalhes do Documento - ZapSign',
    data: { breadcrumb: 'Detalhes do Documento' }
  },
  {
    path: ':id/analysis',
    loadComponent: () => import('./components/document-analysis/document-analysis.component').then(m => m.DocumentAnalysisComponent),
    title: 'Análise do Documento - ZapSign',
    data: { breadcrumb: 'Análise com IA' }
  },
  {
    path: ':id/sign',
    loadComponent: () => import('./components/document-signing/document-signing.component').then(m => m.DocumentSigningComponent),
    title: 'Assinatura do Documento - ZapSign',
    data: { breadcrumb: 'Assinar Documento' }
  }
];