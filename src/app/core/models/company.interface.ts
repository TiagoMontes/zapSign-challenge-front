/**
 * Company entity interface representing a company in the ZapSign system.
 * Companies are used to organize documents and provide API tokens for ZapSign integration.
 */
export interface Company {
  /** Unique identifier for the company */
  id: number;
  /** Display name of the company */
  name: string;
  /** API token used for ZapSign integration */
  api_token: string;
  /** Array of documents associated with this company */
  documents?: CompanyDocument[];
  /** ISO timestamp when the company was created */
  created_at: string;
  /** ISO timestamp when the company was last updated */
  last_updated_at: string;
}

/**
 * Simplified document representation for company context.
 * Used in company details API response.
 */
export interface CompanyDocument {
  /** Unique identifier for the document */
  id: number;
  /** Display name of the document */
  name: string;
  /** Current status of the document in ZapSign */
  status: 'draft' | 'pending' | 'completed' | 'cancelled' | 'expired';
  /** Number of signers associated with this document */
  signers_count?: number;
  /** ISO timestamp when the document was created */
  created_at: string;
}

/**
 * Request payload for creating a new company.
 * Both fields are required for successful company creation.
 */
export interface CreateCompanyRequest {
  /** Display name of the company */
  name: string;
  /** API token for ZapSign integration */
  api_token: string;
}

/**
 * Request payload for updating an existing company.
 * All fields are optional to support partial updates.
 */
export interface UpdateCompanyRequest {
  /** Updated display name of the company */
  name?: string;
  /** Updated API token for ZapSign integration */
  api_token?: string;
}
