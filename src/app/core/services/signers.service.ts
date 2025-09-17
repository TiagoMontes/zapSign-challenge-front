import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Signer, CreateSignerRequest, UpdateSignerRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SignersService extends BaseApiService {

  getSigners(documentId?: number): Observable<Signer[]> {
    const endpoint = documentId ? `/signers/?document_id=${documentId}` : '/signers/';
    return this.get<Signer[]>(endpoint);
  }

  getSigner(id: number): Observable<Signer> {
    return this.get<Signer>(`/signers/${id}/`);
  }

  createSigner(signer: CreateSignerRequest): Observable<Signer> {
    return this.post<Signer>('/signers/', signer);
  }

  updateSigner(id: number, signer: UpdateSignerRequest): Observable<Signer> {
    return this.put<Signer>(`/signers/${id}/`, signer);
  }

  deleteSigner(id: number): Observable<null> {
    return this.delete<null>(`/signers/${id}/`);
  }
}