import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/companies-list/companies-list.component').then(m => m.CompaniesListComponent),
    title: 'Companies - ZapSign',
    data: { breadcrumb: 'All Companies' }
  },
  {
    path: 'create',
    loadComponent: () => import('./components/company-form/company-form.component').then(m => m.CompanyFormComponent),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Create Company - ZapSign',
    data: { breadcrumb: 'Create Company' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/company-detail/company-detail.component').then(m => m.CompanyDetailComponent),
    title: 'Company Details - ZapSign',
    data: { breadcrumb: 'Company Details' }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/company-form/company-form.component').then(m => m.CompanyFormComponent),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Edit Company - ZapSign',
    data: { breadcrumb: 'Edit Company' }
  },
  {
    path: ':id/documents',
    loadComponent: () => import('./components/company-documents/company-documents.component').then(m => m.CompanyDocumentsComponent),
    title: 'Company Documents - ZapSign',
    data: { breadcrumb: 'Documents' }
  }
];