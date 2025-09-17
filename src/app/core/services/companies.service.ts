import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService extends BaseApiService {

  getCompanies(): Observable<Company[]> {
    return this.get<Company[]>('/companies/');
  }

  getCompany(id: number): Observable<Company> {
    return this.get<Company>(`/companies/${id}/`);
  }

  createCompany(company: CreateCompanyRequest): Observable<Company> {
    return this.post<Company>('/companies/', company);
  }

  updateCompany(id: number, company: UpdateCompanyRequest): Observable<Company> {
    return this.put<Company>(`/companies/${id}/`, company);
  }

  deleteCompany(id: number): Observable<null> {
    return this.delete<null>(`/companies/${id}/`);
  }
}