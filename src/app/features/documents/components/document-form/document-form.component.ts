import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DocumentsService } from '../../../../core/services/documents.service';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company, CreateDocumentRequest, CreateDocumentSignerRequest } from '../../../../core/models';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly documentsService = inject(DocumentsService);
  private readonly companiesService = inject(CompaniesService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  documentForm!: FormGroup;
  companies = signal<Company[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  preselectedCompanyId = signal<number | null>(null);

  ngOnInit(): void {
    this.initializeForm();
    this.loadCompanies();
    this.checkForPreselectedCompany();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the reactive form
   */
  private initializeForm(): void {
    this.documentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      company_id: ['', [Validators.required]],
      url_pdf: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\.pdf$/i)]],
      signers: this.fb.array([this.createSignerFormGroup()], [Validators.required])
    });
  }

  /**
   * Create a new signer form group
   */
  private createSignerFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Get the signers form array
   */
  get signersArray(): FormArray {
    return this.documentForm.get('signers') as FormArray;
  }

  /**
   * Load companies for selection
   */
  private loadCompanies(): void {
    this.companiesService.getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (companies) => {
          this.companies.set(companies);
        },
        error: (error) => {
          console.error('Error loading companies:', error);
          this.error.set('Failed to load companies');
        }
      });
  }

  /**
   * Check for preselected company from query params
   */
  private checkForPreselectedCompany(): void {
    const companyId = this.route.snapshot.queryParamMap.get('companyId');
    if (companyId && !isNaN(+companyId)) {
      this.preselectedCompanyId.set(+companyId);
      this.documentForm.patchValue({ company_id: +companyId });
    }
  }

  /**
   * Add a new signer
   */
  onAddSigner(): void {
    this.signersArray.push(this.createSignerFormGroup());
  }

  /**
   * Remove a signer at specific index
   */
  onRemoveSigner(index: number): void {
    if (this.signersArray.length > 1) {
      this.signersArray.removeAt(index);
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.documentForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.error.set(null);

      const formValue = this.documentForm.value;
      const request: CreateDocumentRequest = {
        name: formValue.name,
        company_id: formValue.company_id,
        url_pdf: formValue.url_pdf,
        signers: formValue.signers
      };

      this.documentsService.createDocument(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (document) => {
            this.router.navigate(['/documents', document.id]);
          },
          error: (error) => {
            console.error('Error creating document:', error);
            this.error.set('Failed to create document. Please try again.');
            this.isSubmitting.set(false);
          }
        });
    } else {
      this.markFormGroupTouched(this.documentForm);
    }
  }

  /**
   * Cancel form and navigate back
   */
  onCancel(): void {
    const companyId = this.preselectedCompanyId();
    if (companyId) {
      this.router.navigate(['/companies', companyId]);
    } else {
      this.router.navigate(['/companies']);
    }
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(item => {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item);
          } else {
            item.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  /**
   * Check if a form control has an error
   */
  hasError(controlName: string): boolean {
    const control = this.documentForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Get error message for a form control
   */
  getErrorMessage(controlName: string): string {
    const control = this.documentForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return `${controlName} is required`;
      if (control.errors['minlength']) return `${controlName} is too short`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['pattern']) return 'Please enter a valid PDF URL';
    }
    return '';
  }

  /**
   * Check if a signer control has an error
   */
  hasSignerError(index: number, controlName: string): boolean {
    const control = this.signersArray.at(index).get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Get error message for a signer control
   */
  getSignerErrorMessage(index: number, controlName: string): string {
    const control = this.signersArray.at(index).get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return `${controlName} is required`;
      if (control.errors['minlength']) return `${controlName} is too short`;
      if (control.errors['email']) return 'Please enter a valid email';
    }
    return '';
  }

  /**
   * Track by function for signers array
   */
  trackBySigner(index: number): number {
    return index;
  }

  /**
   * Get the name of the selected company
   */
  getSelectedCompanyName(): string {
    const companyId = this.preselectedCompanyId();
    if (companyId) {
      const company = this.companies().find(c => c.id === companyId);
      return company ? company.name : 'Unknown Company';
    }
    return '';
  }
}