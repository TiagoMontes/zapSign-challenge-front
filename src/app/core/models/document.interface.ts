import { Signer } from './signer.interface';
import { Company } from './company.interface';

/**
 * Document status enumeration for ZapSign integration
 */
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

/**
 * Document processing status enumeration
 */
export enum ProcessingStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Document entity interface representing a document in the ZapSign system.
 * Documents are linked to companies and contain multiple signers.
 */
export interface Document {
  /** Unique identifier for the document */
  id: number;
  /** Reference to the company this document belongs to */
  company: Company;
  /** Display name of the document */

  company_id: number;
  name: string;
  /** Array of signers associated with this document */
  signers: Signer[];
  /** Current status of the document in ZapSign */
  status: DocumentStatus;
  /** ZapSign document token for integration */
  token: string;
  /** ZapSign open ID for public access */
  open_id: string;
  /** ID of the user who created the document */
  created_by: number;
  /** External ID for additional reference */
  external_id: string | null;
  /** URL to the PDF document */
  url_pdf: string;
  /** Processing status of the document */
  processing_status: ProcessingStatus;
  /** Document checksum for integrity verification */
  checksum: string;
  /** Version ID for document versioning */
  version_id: string;
  /** ISO timestamp when the document was created */
  created_at: string;
  /** ISO timestamp when the document was last updated */
  last_updated_at: string;
}

/**
 * Request payload for creating a new document with ZapSign integration.
 * The document will be processed through ZapSign API using the company's API token.
 */
export interface CreateDocumentRequest {
  /** Display name of the document */
  name: string;
  /** ID of the company this document belongs to */
  company_id: number;
  /** URL to the PDF document to be signed */
  url_pdf: string;
  /** Array of signers to be added to the document */
  signers: CreateDocumentSignerRequest[];
}

/**
 * Signer information for document creation request.
 * Used when creating a document with initial signers.
 */
export interface CreateDocumentSignerRequest {
  /** Full name of the signer */
  name: string;
  /** Email address of the signer */
  email: string;
}

/**
 * AI analysis result for a document.
 * Contains insights, summary, and missing topics identified by AI.
 */
export interface DocumentAnalysis {
  /** Array of topics missing from the document */
  missing_topics: string[];
  /** AI-generated summary of the document */
  summary: string;
  /** AI-generated insights about the document */
  insights: string;
  /** ISO timestamp when the analysis was performed */
  analyzed_at: string;
}