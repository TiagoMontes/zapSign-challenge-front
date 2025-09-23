import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  AfterViewInit,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { CompaniesService } from '../../../../core/services/companies.service';
import { DocumentsService } from '../../../../core/services/documents.service';
import {
  Company,
  CompanyDocument,
  UpdateCompanyRequest,
} from '../../../../core/models/company.interface';
import {
  CreateDocumentRequest,
  CreateDocumentSignerRequest,
} from '../../../../core/models/document.interface';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './company-detail.component.html',
})
export class CompanyDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly companiesService = inject(CompaniesService);
  private readonly documentsService = inject(DocumentsService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  company = signal<Company | null>(null);
  companyDocuments = signal<CompanyDocument[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Document creation modal state
  showCreateDocumentModal = signal<boolean>(false);
  isCreatingDocument = signal<boolean>(false);
  documentCreationError = signal<string | null>(null);

  // Edit company modal state
  showEditCompanyModal = signal<boolean>(false);
  isEditingCompany = signal<boolean>(false);
  companyEditError = signal<string | null>(null);

  // Document form state
  documentName = signal<string>('');
  documentUrlPdf = signal<string>('');
  signers = signal<CreateDocumentSignerRequest[]>([{ name: '', email: '' }]);

  // Edit company form state
  editCompanyName = signal<string>('');
  editCompanyApiToken = signal<string>('');

  // Computed properties
  hasCompany = computed(() => !!this.company());
  hasDocuments = computed(() => this.companyDocuments().length > 0);
  totalDocuments = computed(() => this.companyDocuments().length);
  pendingDocuments = computed(
    () => this.companyDocuments().filter((doc) => doc.status === 'pending').length,
  );
  completedDocuments = computed(
    () => this.companyDocuments().filter((doc) => doc.status === 'completed').length,
  );
  totalSigners = computed(() =>
    this.companyDocuments().reduce((total, doc) => total + (doc.signers_count || 0), 0),
  );

  // Document form computed properties
  isFormValid = computed(() => {
    const name = this.documentName().trim();
    const urlPdf = this.documentUrlPdf().trim();
    const signersValid = this.signers().every(
      (signer) =>
        signer.name.trim() && signer.email.trim() && this.isValidEmail(signer.email.trim()),
    );
    return name && urlPdf && signersValid && this.signers().length > 0;
  });

  canCreateDocument = computed(
    () => this.isFormValid() && !this.isCreatingDocument() && this.hasCompany(),
  );

  // Edit company form computed properties
  isEditFormValid = computed(() => {
    const name = this.editCompanyName().trim();
    return name.length > 0;
  });

  canEditCompany = computed(
    () => this.isEditFormValid() && !this.isEditingCompany() && this.hasCompany(),
  );
  companyAge = computed(() => {
    const company = this.company();
    if (!company) return '';

    const created = new Date(company.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 30) return `${diffDays} dias atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  });

  ngOnInit(): void {
    this.loadCompanyData();
  }

  ngAfterViewInit(): void {
    // Listen for navigation events
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        // Check if we're navigating back to this company's page
        if (event.url.includes('/companies/')) {
          const urlSegments = event.url.split('/');
          if (
            urlSegments.length >= 3 &&
            urlSegments[1] === 'companies' &&
            !isNaN(+urlSegments[2])
          ) {
            
            // Force refresh to bypass cache and get latest data
            setTimeout(() => this.loadCompanyData(true), 100);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load company data and related information
   */
  private loadCompanyData(forceRefresh: boolean = false): void {
    const companyId = this.route.snapshot.paramMap.get('id');

    if (!companyId || isNaN(+companyId)) {
      this.error.set('ID da empresa inválido');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Force refresh to bypass cache when needed
    this.companiesService
      .getCompany(+companyId, !forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          this.company.set(company);
          this.companyDocuments.set(company.documents || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading company data:', error);
          this.error.set('Falhou ao carregar detalhes da empresa. Tente novamente.');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Open edit company modal
   */
  onEditCompany(): void {
    const company = this.company();
    if (company) {
      // Pre-fill form with current company data
      this.editCompanyName.set(company.name);
      this.editCompanyApiToken.set(company.api_token || '');
      this.companyEditError.set(null);
      this.showEditCompanyModal.set(true);
    }
  }

  /**
   * Delete company with confirmation
   */
  onDeleteCompany(): void {
    const company = this.company();
    if (!company) return;

    const confirmed = confirm(
      `Tem certeza que deseja excluir "${company.name}"? Isso também excluirá todos os documentos e signatários associados. Esta ação não pode ser desfeita.`,
    );
    if (confirmed) {
      this.deleteCompany(company);
    }
  }

  /**
   * Execute company deletion
   */
  private deleteCompany(company: Company): void {
    this.companiesService
      .deleteCompany(company.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/companies']);
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          alert('Falhou ao excluir empresa. Tente novamente.');
        },
      });
  }

  /**
   * Open create document modal for this company
   */
  onCreateDocument(): void {
    const company = this.company();
    if (company) {
      // Reset form state
      this.documentName.set('');
      this.documentUrlPdf.set('');
      this.signers.set([{ name: '', email: '' }]);
      this.documentCreationError.set(null);
      this.showCreateDocumentModal.set(true);
    }
  }

  /**
   * Navigate to specific document
   */
  onViewDocument(document: CompanyDocument): void {
    this.router.navigate(['/documents', document.id]);
  }

  /**
   * Copy API token to clipboard
   */
  onCopyApiToken(): void {
    const token = this.company()?.api_token;
    if (!token) return;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(token)
        .then(() => {})
        .catch(() => {
          console.error('Failed to copy token to clipboard');
        });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = token;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy token to clipboard');
      }

      document.body.removeChild(textArea);
    }
  }

  /**
   * Refresh company data
   */
  onRefresh(): void {
    this.loadCompanyData(true);
  }

  /**
   * Get status badge classes for documents
   */
  getDocumentStatusClasses(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Truncate API token for display
   */
  getTruncatedToken(token: string): string {
    if (token.length <= 12) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }

  /**
   * Close create document modal
   */
  onCloseCreateDocumentModal(): void {
    if (this.isCreatingDocument()) {
      return; // Prevent closing during document creation
    }
    this.showCreateDocumentModal.set(false);
    this.documentCreationError.set(null);
  }

  /**
   * Handle modal backdrop click
   */
  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCloseCreateDocumentModal();
    }
  }

  /**
   * Create new document
   */
  onCreateDocumentSubmit(): void {
    const company = this.company();
    if (!company || !this.canCreateDocument()) {
      return;
    }

    this.isCreatingDocument.set(true);
    this.documentCreationError.set(null);

    const documentData: CreateDocumentRequest = {
      name: this.documentName().trim(),
      company_id: company.id,
      url_pdf: this.documentUrlPdf().trim(),
      signers: this.signers().map((signer) => ({
        name: signer.name.trim(),
        email: signer.email.trim(),
      })),
    };

    this.documentsService
      .createDocument(documentData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCreatingDocument.set(false);
          this.showCreateDocumentModal.set(false);
          // Refresh company data to include the new document
          this.loadCompanyData(true);
        },
        error: (error) => {
          console.error('Error creating document:', error);
          this.isCreatingDocument.set(false);
          this.documentCreationError.set(
            error?.error?.message || 'Falhou ao criar documento. Tente novamente.',
          );
        },
      });
  }

  /**
   * Add a new signer to the form
   */
  onAddSigner(): void {
    const currentSigners = this.signers();
    this.signers.set([...currentSigners, { name: '', email: '' }]);
  }

  /**
   * Remove a signer from the form
   */
  onRemoveSigner(index: number): void {
    const currentSigners = this.signers();
    if (currentSigners.length > 1) {
      const updatedSigners = currentSigners.filter((_, i) => i !== index);
      this.signers.set(updatedSigners);
    }
  }

  /**
   * Update signer name
   */
  onSignerNameChange(index: number, name: string): void {
    const currentSigners = this.signers();
    const updatedSigners = [...currentSigners];
    updatedSigners[index] = { ...updatedSigners[index], name };
    this.signers.set(updatedSigners);
  }

  /**
   * Update signer email
   */
  onSignerEmailChange(index: number, email: string): void {
    const currentSigners = this.signers();
    const updatedSigners = [...currentSigners];
    updatedSigners[index] = { ...updatedSigners[index], email };
    this.signers.set(updatedSigners);
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Track by function for documents list
   */
  trackByDocument(_index: number, document: CompanyDocument): number {
    return document.id;
  }

  /**
   * Track by function for signers list
   */
  trackBySigner(index: number, _signer: CreateDocumentSignerRequest): number {
    return index;
  }

  /**
   * Close edit company modal
   */
  onCloseEditCompanyModal(): void {
    if (this.isEditingCompany()) {
      return; // Prevent closing during company update
    }
    this.showEditCompanyModal.set(false);
    this.companyEditError.set(null);
  }

  /**
   * Handle edit company modal backdrop click
   */
  onEditCompanyModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCloseEditCompanyModal();
    }
  }

  /**
   * Submit company edit form
   */
  onEditCompanySubmit(): void {
    const company = this.company();
    if (!company || !this.canEditCompany()) {
      return;
    }

    this.isEditingCompany.set(true);
    this.companyEditError.set(null);

    const updateData: UpdateCompanyRequest = { name: this.editCompanyName().trim() };
    const apiToken = this.editCompanyApiToken().trim();
    if (apiToken) {
      updateData.api_token = apiToken;
    }

    this.companiesService
      .updateCompany(company.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isEditingCompany.set(false);
          this.showEditCompanyModal.set(false);
          // Refresh company data to show updated information
          this.loadCompanyData(true);
        },
        error: (error) => {
          console.error('Error updating company:', error);
          this.isEditingCompany.set(false);
          this.companyEditError.set(
            error?.error?.message || 'Falha ao atualizar empresa. Tente novamente.',
          );
        },
      });
  }
}
