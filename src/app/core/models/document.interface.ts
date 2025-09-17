import { Signer } from './signer.interface';

export interface Document {
  id: number;
  name: string;
  company_id: number;
  status: string;
  zapsign_doc_id?: string;
  created_at: string;
  updated_at: string;
  signers?: Signer[];
}

export interface CreateDocumentRequest {
  name: string;
  company_id: number;
  pdf_url: string;
  signers: CreateDocumentSignerRequest[];
}

export interface CreateDocumentSignerRequest {
  name: string;
  email: string;
}

export interface DocumentAnalysis {
  id: number;
  document_id: number;
  analysis_text: string;
  created_at: string;
}