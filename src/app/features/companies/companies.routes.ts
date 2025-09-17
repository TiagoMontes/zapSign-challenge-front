import { Routes } from '@angular/router';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/companies-list/companies-list.component').then(m => m.CompaniesListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/company-form/company-form.component').then(m => m.CompanyFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/company-detail/company-detail.component').then(m => m.CompanyDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/company-form/company-form.component').then(m => m.CompanyFormComponent)
  }
];