import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../../../../core/models/company.interface';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './company-form.component.html'
})
export class CompanyFormComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  companyForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  company = signal<Company | null>(null);
  error = signal<string | null>(null);

  // Computed properties
  pageTitle = computed(() => this.isEditMode() ? 'Editar Empresa' : 'Criar Empresa');
  submitButtonText = computed(() => this.isEditMode() ? 'Atualizar Empresa' : 'Criar Empresa');
  hasUnsavedChanges = computed(() => this.companyForm?.dirty && !this.isSubmitting());

  // Form validation messages
  validationMessages = {
    name: {
      required: 'Nome da empresa é obrigatório',
      minlength: 'Nome da empresa deve ter pelo menos 2 caracteres',
      maxlength: 'Nome da empresa não pode exceder 100 caracteres',
      nameExists: 'Já existe uma empresa com este nome'
    },
    api_token: {
      required: 'Token da API é obrigatório',
      minlength: 'Token da API deve ter pelo menos 8 caracteres',
      maxlength: 'Token da API não pode exceder 255 caracteres',
      pattern: 'Token da API contém caracteres inválidos'
    }
  };

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfEditMode();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * CanComponentDeactivate implementation
   */
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  /**
   * Initialize the reactive form
   */
  private initializeForm(): void {
    this.companyForm = this.fb.group({
      name: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ],
        asyncValidators: [this.uniqueNameValidator()],
        updateOn: 'blur'
      }],
      api_token: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(255),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]]
    });
  }

  /**
   * Check if we're in edit mode and load company data
   */
  private checkIfEditMode(): void {
    const companyId = this.route.snapshot.paramMap.get('id');

    if (companyId && companyId !== 'create') {
      this.isEditMode.set(true);
      this.loadCompany(+companyId);
    }
  }

  /**
   * Load company data for editing
   */
  private loadCompany(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.companiesService.getCompany(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          this.company.set(company);
          this.populateForm(company);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading company:', error);
          this.error.set('Falhou ao carregar dados da empresa. Tente novamente.');
          this.isLoading.set(false);
          console.error('Failed to load company data');
        }
      });
  }

  /**
   * Populate form with company data
   */
  private populateForm(company: Company): void {
    this.companyForm.patchValue({
      name: company.name,
      api_token: company.api_token
    });

    // Mark form as pristine after loading data
    this.companyForm.markAsPristine();
  }

  /**
   * Setup form validation and real-time feedback
   */
  private setupFormValidation(): void {
    // Setup real-time validation feedback
    this.companyForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.error.set(null);
      });
  }

  /**
   * Custom async validator to check for unique company names
   */
  private uniqueNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.value.length < 2) {
        return of(null);
      }

      const currentCompanyId = this.company()?.id;

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(name =>
          this.companiesService.companyExistsByName(name, currentCompanyId)
            .pipe(
              map(exists => exists ? { nameExists: true } : null)
            )
        )
      );
    };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.companyForm.invalid || this.isSubmitting()) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.companyForm.value;

    if (this.isEditMode()) {
      this.updateCompany(formData);
    } else {
      this.createCompany(formData);
    }
  }

  /**
   * Create new company
   */
  private createCompany(data: CreateCompanyRequest): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.companiesService.createCompany(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          console.log(`Company "${company.name}" created successfully`);
          this.companyForm.markAsPristine();
          this.router.navigate(['/companies', company.id]);
        },
        error: (error) => {
          console.error('Error creating company:', error);
          this.handleSubmissionError(error);
        },
        complete: () => {
          this.isSubmitting.set(false);
        }
      });
  }

  /**
   * Update existing company
   */
  private updateCompany(data: UpdateCompanyRequest): void {
    const companyId = this.company()!.id;
    this.isSubmitting.set(true);
    this.error.set(null);

    this.companiesService.updateCompany(companyId, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          this.company.set(company);
          console.log(`Company "${company.name}" updated successfully`);
          this.companyForm.markAsPristine();
          this.router.navigate(['/companies', company.id]);
        },
        error: (error) => {
          console.error('Error updating company:', error);
          this.handleSubmissionError(error);
        },
        complete: () => {
          this.isSubmitting.set(false);
        }
      });
  }

  /**
   * Handle submission errors
   */
  private handleSubmissionError(error: any): void {
    let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';

    if (error.status === 400 && error.error) {
      // Handle field-specific validation errors
      const fieldErrors = error.error;

      if (fieldErrors.name) {
        this.companyForm.get('name')?.setErrors({ serverError: fieldErrors.name[0] });
      }

      if (fieldErrors.api_token) {
        this.companyForm.get('api_token')?.setErrors({ serverError: fieldErrors.api_token[0] });
      }

      errorMessage = 'Por favor, corrija os erros destacados e tente novamente.';
    } else if (error.status === 409) {
      errorMessage = 'Uma empresa com este nome já existe.';
      this.companyForm.get('name')?.setErrors({ nameExists: true });
    }

    this.error.set(errorMessage);
    console.error(errorMessage);
  }

  /**
   * Cancel form and navigate back
   */
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) {
        return;
      }
    }

    this.navigateBack();
  }

  /**
   * Navigate back to appropriate page
   */
  private navigateBack(): void {
    if (this.isEditMode() && this.company()) {
      this.router.navigate(['/companies', this.company()!.id]);
    } else {
      this.router.navigate(['/companies']);
    }
  }

  /**
   * Generate a random API token
   */
  onGenerateToken(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let token = 'tok_';

    for (let i = 0; i < 32; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    this.companyForm.patchValue({ api_token: token });
    this.companyForm.get('api_token')?.markAsTouched();
  }

  /**
   * Get error message for a form field
   */
  getFieldError(fieldName: string): string | null {
    const field = this.companyForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return null;
    }

    const errors = field.errors;
    const messages = this.validationMessages[fieldName as keyof typeof this.validationMessages];

    // Check for server errors first
    if (errors['serverError']) {
      return errors['serverError'];
    }

    // Check for standard validation errors
    for (const errorType in errors) {
      if (messages[errorType as keyof typeof messages]) {
        return messages[errorType as keyof typeof messages];
      }
    }

    return 'Entrada inválida';
  }

  /**
   * Check if a field has errors
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.companyForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.companyForm.controls).forEach(key => {
      const control = this.companyForm.get(key);
      control?.markAsTouched();
    });
  }


  /**
   * Copy API token to clipboard
   */
  onCopyToken(): void {
    const token = this.companyForm.get('api_token')?.value;

    if (token && navigator.clipboard) {
      navigator.clipboard.writeText(token).then(() => {
        console.log('API token copied to clipboard');
      }).catch(() => {
        console.error('Failed to copy token to clipboard');
      });
    }
  }

  /**
   * Check if API token has valid format
   */
  isTokenFormatValid(): boolean {
    const token = this.companyForm.get('api_token')?.value || '';
    return /^[a-zA-Z0-9_-]+$/.test(token);
  }
}