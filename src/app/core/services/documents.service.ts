import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Document, CreateDocumentRequest, DocumentAnalysis } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService extends BaseApiService {

  getDocuments(companyId?: number): Observable<Document[]> {
    const endpoint = companyId ? `/documents/?company_id=${companyId}` : '/documents/';
    return this.get<Document[]>(endpoint);
  }

  getDocument(id: number): Observable<Document> {
    return this.get<Document>(`/documents/${id}/`);
  }

  createDocument(document: CreateDocumentRequest): Observable<Document> {
    return this.post<Document>('/documents/', document);
  }

  deleteDocument(id: number): Observable<null> {
    return this.delete<null>(`/documents/${id}/`);
  }

  analyzeDocument(id: number): Observable<DocumentAnalysis> {
    return this.post<DocumentAnalysis>(`/documents/${id}/analyze/`, {});
  }
}