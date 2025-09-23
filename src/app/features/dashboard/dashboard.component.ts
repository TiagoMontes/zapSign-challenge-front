import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';

import { CompaniesService } from '../../core/services/companies.service';
import { DocumentsService } from '../../core/services/documents.service';
import { SignersService } from '../../core/services/signers.service';
import { NavigationService } from '../../core/services/navigation.service';
import { NotificationService } from '../../core/services/notification.service';
import { Company, Document, DocumentStatus, Signer } from '../../core/models';

interface DashboardStats {
  totalDocuments: number;
  pendingDocuments: number;
  completedDocuments: number;
  totalCompanies: number;
  totalSigners: number;
}

interface RecentActivity {
  id: string;
  type: 'document' | 'company' | 'signer';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Injected services
  private companiesService = inject(CompaniesService);
  private documentsService = inject(DocumentsService);
  private signersService = inject(SignersService);
  private navigationService = inject(NavigationService);
  private notificationService = inject(NotificationService);

  // Signals for reactive state management
  stats = signal<DashboardStats>({
    totalDocuments: 0,
    pendingDocuments: 0,
    completedDocuments: 0,
    totalCompanies: 0,
    totalSigners: 0,
  });

  recentActivity = signal<RecentActivity[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  // Computed values
  documentsProgress = computed(() => {
    const currentStats = this.stats();
    if (currentStats.totalDocuments === 0) return 0;
    return Math.round((currentStats.completedDocuments / currentStats.totalDocuments) * 100);
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    // Load all data in parallel
    const companies$ = this.companiesService.getCompanies().pipe(
      catchError((error) => {
        console.error('Error loading companies:', error);
        return of([]);
      }),
    );

    const documents$ = this.documentsService.getDocuments().pipe(
      catchError((error) => {
        console.error('Error loading documents:', error);
        return of([]);
      }),
    );

    const signers$ = this.signersService.getSigners().pipe(
      catchError((error) => {
        console.error('Error loading signers:', error);
        return of([]);
      }),
    );

    forkJoin({
      companies: companies$,
      documents: documents$,
      signers: signers$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ companies, documents, signers }) => {
          this.updateStats(companies, documents, signers);
          this.updateRecentActivity(companies, documents, signers);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.hasError.set(true);
          this.isLoading.set(false);
          this.notificationService.showError('Failed to load dashboard data');
        },
      });
  }

  private updateStats(companies: Company[], documents: Document[], signers: Signer[]): void {
    const pendingDocuments = documents.filter(
      (doc) => doc.status === DocumentStatus.PENDING || doc.status === DocumentStatus.DRAFT,
    ).length;

    const completedDocuments = documents.filter(
      (doc) => doc.status === DocumentStatus.COMPLETED,
    ).length;

    this.stats.set({
      totalDocuments: documents.length,
      pendingDocuments,
      completedDocuments,
      totalCompanies: companies.length,
      totalSigners: signers.length,
    });
  }

  private updateRecentActivity(
    companies: Company[],
    documents: Document[],
    _signers: Signer[],
  ): void {
    const activities: RecentActivity[] = [];

    // Add recent documents (last 5)
    const recentDocuments = documents
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    recentDocuments.forEach((doc) => {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document',
        title: doc.name,
        description: this.getDocumentActivityDescription(doc),
        timestamp: new Date(doc.created_at),
        icon: 'document',
      });
    });

    // Add recent companies (last 2)
    const recentCompanies = companies
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);

    recentCompanies.forEach((company) => {
      activities.push({
        id: `company-${company.id}`,
        type: 'company',
        title: company.name,
        description: 'Company added',
        timestamp: new Date(company.created_at),
        icon: 'building',
      });
    });

    // Sort all activities by timestamp and take the most recent
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    this.recentActivity.set(sortedActivities);
  }

  private getDocumentActivityDescription(document: Document): string {
    switch (document.status) {
      case DocumentStatus.COMPLETED:
        return 'Document completed';
      case DocumentStatus.PENDING:
        return 'Awaiting signatures';
      case DocumentStatus.DRAFT:
        return 'Document created';
      case DocumentStatus.CANCELLED:
        return 'Document cancelled';
      case DocumentStatus.EXPIRED:
        return 'Document expired';
      default:
        return 'Document updated';
    }
  }

  // Quick action methods
  onCreateDocument(): void {
    this.navigationService.navigateToCreateDocument();
  }

  onAddCompany(): void {
    this.navigationService.navigateToCreateCompany();
  }

  onViewAllDocuments(): void {
    this.navigationService.navigateTo('/documents');
  }

  onViewAllCompanies(): void {
    this.navigationService.navigateToCompanies();
  }

  onActivityClick(activity: RecentActivity): void {
    switch (activity.type) {
      case 'document':
        const docId = activity.id.replace('doc-', '');
        this.navigationService.navigateToDocument(docId);
        break;
      case 'company':
        const companyId = activity.id.replace('company-', '');
        this.navigationService.navigateToCompany(companyId);
        break;
      case 'signer':
        const signerId = activity.id.replace('signer-', '');
        this.navigationService.navigateToSigner(signerId);
        break;
    }
  }

  onRefresh(): void {
    this.loadDashboardData();
  }

  // Utility methods for template
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getStatColor(type: string): string {
    switch (type) {
      case 'documents':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'companies':
        return 'text-purple-600';
      case 'signers':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatBgColor(type: string): string {
    switch (type) {
      case 'documents':
        return 'bg-blue-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'completed':
        return 'bg-green-100';
      case 'companies':
        return 'bg-purple-100';
      case 'signers':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  }

  getActivityIconBg(type: string): string {
    switch (type) {
      case 'document':
        return 'bg-blue-100';
      case 'company':
        return 'bg-purple-100';
      case 'signer':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  }

  getActivityIconColor(type: string): string {
    switch (type) {
      case 'document':
        return 'text-blue-600';
      case 'company':
        return 'text-purple-600';
      case 'signer':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'company':
        return 'bg-purple-100 text-purple-800';
      case 'signer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackActivityById(_index: number, activity: RecentActivity): string {
    return activity.id;
  }
}
