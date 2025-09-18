import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap, from, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SignersService } from '../../../../core/services/signers.service';
import { DocumentsService } from '../../../../core/services/documents.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Signer, Document } from '../../../../core/models';
import { SignerStatusComponent } from '../signer-status/signer-status.component';

@Component({
  selector: 'app-signer-detail',
  standalone: true,
  imports: [CommonModule, SignerStatusComponent],
  templateUrl: './signer-detail.component.html',
  styleUrls: ['./signer-detail.component.scss']
})
export class SignerDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly signersService = inject(SignersService);
  private readonly documentsService = inject(DocumentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  signer = signal<Signer | null>(null);
  associatedDocuments = signal<Document[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingDocuments = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed properties
  hasSigner = computed(() => !!this.signer());
  hasAssociatedDocuments = computed(() => this.associatedDocuments().length > 0);
  canEdit = computed(() => this.hasSigner() && !this.isDeleting() && !this.isSyncing());
  canDelete = computed(() => this.hasSigner() && !this.isDeleting() && !this.isSyncing());
  canSync = computed(() => this.hasSigner() && !this.isDeleting() && !this.isSyncing());
  hasToken = computed(() => !!this.signer()?.token);
  hasExternalId = computed(() => !!this.signer()?.external_id);
  hasSignUrl = computed(() => !!this.signer()?.sign_url);
  hasCreatedAt = computed(() => !!this.signer()?.created_at);
  hasUpdatedAt = computed(() => !!this.signer()?.last_updated_at);
  primaryDocument = computed(() => this.associatedDocuments()[0] || null);

  ngOnInit(): void {
    this.loadSignerData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load signer data and associated documents
   */
  private loadSignerData(): void {
    const signerId = this.route.snapshot.paramMap.get('id');

    if (!signerId || isNaN(+signerId)) {
      this.error.set('Invalid signer ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.signersService.getSigner(+signerId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(signer => {
          this.signer.set(signer);

          // Load associated documents using the new method
          if (signer.document_ids && signer.document_ids.length > 0) {
            this.isLoadingDocuments.set(true);
            return this.signersService.getDocumentsForSigner(signer);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (documents) => {
          this.associatedDocuments.set(documents);
          this.isLoading.set(false);
          this.isLoadingDocuments.set(false);

          // Log warning if some documents couldn't be loaded
          const signer = this.signer();
          if (signer && signer.document_ids && signer.document_ids.length > documents.length) {
            console.warn(`Some documents could not be loaded. Expected ${signer.document_ids.length}, loaded ${documents.length}`);
          }
        },
        error: (error) => {
          console.error('Error loading signer data:', error);
          this.error.set('Failed to load signer details. Please try again.');
          this.isLoading.set(false);
          this.isLoadingDocuments.set(false);
        }
      });
  }


  /**
   * Navigate to edit signer form
   */
  onEditSigner(): void {
    const signer = this.signer();
    if (signer) {
      this.router.navigate(['/signers', signer.id, 'edit']);
    }
  }

  /**
   * Delete signer with confirmation - removes from ZapSign external system
   */
  onDeleteSigner(): void {
    const signer = this.signer();
    if (!signer) return;

    const confirmed = confirm(
      `Tem certeza de que deseja remover o signatário "${signer.name}" do sistema ZapSign? Esta ação não pode ser desfeita.`
    );

    if (confirmed) {
      this.isDeleting.set(true);
      this.error.set(null);

      this.signersService.removeSignerExternal(signer.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Signatário removido com sucesso do ZapSign');
            // Navigate back to the primary document or signers list
            const documents = this.associatedDocuments();
            if (documents.length > 0) {
              this.router.navigate(['/documents', documents[0].id]);
            } else {
              this.router.navigate(['/signers']);
            }
          },
          error: (error) => {
            console.error('Error removing signer from external system:', error);
            this.error.set('Falha ao remover signatário do ZapSign. Tente novamente.');
            this.notificationService.showError('Falha ao remover signatário do ZapSign');
            this.isDeleting.set(false);
          }
        });
    }
  }

  /**
   * Navigate back to the primary associated document or documents list
   */
  onBackToDocument(): void {
    const documents = this.associatedDocuments();
    if (documents.length > 0) {
      // Navigate to the first document (primary document)
      this.router.navigate(['/documents', documents[0].id]);
    } else {
      // If no associated documents, try to get document ID from route state
      const navigationExtras = this.router.getCurrentNavigation()?.extras?.state;
      const documentId = navigationExtras?.['documentId'];

      if (documentId) {
        this.router.navigate(['/documents', documentId]);
      } else {
        // Check if there's a document ID in the signer data and try to navigate there
        const signer = this.signer();
        if (signer?.document_ids && signer.document_ids.length > 0) {
          this.router.navigate(['/documents', signer.document_ids[0]]);
        } else {
          // Fallback to signers list
          this.router.navigate(['/signers']);
        }
      }
    }
  }

  /**
   * Navigate to a specific document
   */
  onNavigateToDocument(documentId: number): void {
    this.router.navigate(['/documents', documentId]);
  }

  /**
   * Navigate back to signers list
   */
  onBackToSigners(): void {
    this.router.navigate(['/signers']);
  }

  /**
   * Refresh signer data
   */
  onRefresh(): void {
    this.loadSignerData();
  }

  /**
   * Sync signer with ZapSign API
   */
  onSyncSigner(): void {
    const signer = this.signer();
    if (!signer) return;

    this.isSyncing.set(true);
    this.error.set(null);

    this.signersService.syncSigner(signer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSigner) => {
          this.signer.set(updatedSigner);
          this.notificationService.showSuccess('Signatário sincronizado com sucesso');
          this.isSyncing.set(false);
        },
        error: (error) => {
          console.error('Error syncing signer:', error);
          this.error.set('Falha ao sincronizar signatário. Tente novamente.');
          this.notificationService.showError('Falha ao sincronizar signatário');
          this.isSyncing.set(false);
        }
      });
  }

  /**
   * Copy token to clipboard
   */
  onCopyToken(): void {
    const signer = this.signer();
    if (signer?.token) {
      navigator.clipboard.writeText(signer.token).then(() => {
        this.notificationService.showSuccess('Token copied to clipboard');
      }).catch(() => {
        this.notificationService.showError('Failed to copy token');
      });
    }
  }

  /**
   * Copy external ID to clipboard
   */
  onCopyExternalId(): void {
    const signer = this.signer();
    if (signer?.external_id) {
      navigator.clipboard.writeText(signer.external_id).then(() => {
        this.notificationService.showSuccess('External ID copied to clipboard');
      }).catch(() => {
        this.notificationService.showError('Failed to copy external ID');
      });
    }
  }

  /**
   * Open sign URL in new tab
   */
  onOpenSignUrl(): void {
    const signer = this.signer();
    if (signer?.sign_url) {
      window.open(signer.sign_url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Copy sign URL to clipboard
   */
  onCopySignUrl(): void {
    const signer = this.signer();
    if (signer?.sign_url) {
      navigator.clipboard.writeText(signer.sign_url).then(() => {
        this.notificationService.showSuccess('Sign URL copied to clipboard');
      }).catch(() => {
        this.notificationService.showError('Failed to copy sign URL');
      });
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get signer initials for display
   */
  getSignerInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Truncate long strings for display
   */
  truncateString(str: string, maxLength: number = 50): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }

  /**
   * TrackBy function for documents list
   */
  trackByDocumentId(index: number, document: Document): number {
    return document.id;
  }
}