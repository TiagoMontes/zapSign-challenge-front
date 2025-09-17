export interface Signer {
  id: number;
  name: string;
  email: string;
  document_id: number;
  status?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSignerRequest {
  name: string;
  email: string;
  document_id?: number; // Optional for document creation flow
}

export interface UpdateSignerRequest {
  name?: string;
  email?: string;
}