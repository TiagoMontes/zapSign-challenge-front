export interface Company {
  id: number;
  name: string;
  api_token: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  api_token: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  api_token?: string;
}