import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/companies-list/companies-list.component').then(
        (m) => m.CompaniesListComponent,
      ),
    title: 'Empresas - ZapSign',
    data: { breadcrumb: 'Todas as Empresas' },
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/company-form/company-form.component').then(
        (m) => m.CompanyFormComponent,
      ),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Criar Empresa - ZapSign',
    data: { breadcrumb: 'Criar Empresa' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/company-detail/company-detail.component').then(
        (m) => m.CompanyDetailComponent,
      ),
    title: 'Detalhes da Empresa - ZapSign',
    data: { breadcrumb: 'Detalhes da Empresa' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/company-form/company-form.component').then(
        (m) => m.CompanyFormComponent,
      ),
    canDeactivate: [UnsavedChangesGuard],
    title: 'Editar Empresa - ZapSign',
    data: { breadcrumb: 'Editar Empresa' },
  },
];
