/**
 * Signer status enumeration for tracking signing progress
 * Updated to match ZapSign API status values
 */
export enum SignerStatus {
  NEW = 'new',
  PENDING = 'pending',
  SIGNED = 'signed',
  DECLINED = 'declined',
  INVITED = 'invited',
  ERROR = 'error',
  EXPIRED = 'expired'
}

/**
 * Signer entity interface representing a person who signs documents.
 * Signers are linked to documents and track signing status.
 */
export interface Signer {
  /** Unique identifier for the signer */
  id: number;
  /** Full name of the signer */
  name: string;
  /** Email address of the signer */
  email: string;
  /** ZapSign token for this signer */
  token: string;
  /** Current signing status */
  status: SignerStatus;
  /** External ID for additional reference */
  external_id: string | null;
  /** ZapSign URL for signing the document */
  sign_url: string;
  /** Array of document IDs this signer belongs to */
  document_ids: number[];
  /** ISO timestamp when the document was signed (if signed) */
  signed_at?: string;
  /** ISO timestamp when the signer was created */
  created_at: string;
  /** ISO timestamp when the signer was last updated */
  last_updated_at: string;
}

/**
 * Request payload for creating a new signer.
 * Document ID is optional when creating signers as part of document creation.
 */
export interface CreateSignerRequest {
  /** Full name of the signer */
  name: string;
  /** Email address of the signer */
  email: string;
  /** ID of the document this signer belongs to (optional for document creation flow) */
  document_id?: number;
}

/**
 * Request payload for updating an existing signer.
 * All fields are optional to support partial updates.
 */
export interface UpdateSignerRequest {
  /** Updated full name of the signer */
  name?: string;
  /** Updated email address of the signer */
  email?: string;
}