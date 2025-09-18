import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SignersService } from '../../../../core/services/signers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Signer, UpdateSignerRequest, CreateSignerRequest } from '../../../../core/models';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-signer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signer-form.component.html',
  styleUrls: ['./signer-form.component.scss']
})
export class SignerFormComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly signersService = inject(SignersService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  signer = signal<Signer | null>(null);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  signerForm: FormGroup;

  // Mode detection
  isEditMode = computed(() => !!this.route.snapshot.paramMap.get('id'));
  pageTitle = computed(() => this.isEditMode() ? 'Edit Signer' : 'Create Signer');
  submitButtonText = computed(() => this.isEditMode() ? 'Save Changes' : 'Create Signer');

  // Form state
  canSubmit = computed(() => this.signerForm.valid && !this.isSubmitting());

  constructor() {
    this.signerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s\-']+$/) // Letters, spaces, hyphens, apostrophes
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode()) {
      this.loadSignerData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * CanComponentDeactivate guard interface implementation
   */
  canDeactivate(): boolean {
    return !this.hasUnsavedChanges();
  }

  /**
   * CanComponentDeactivate guard interface implementation
   */
  hasUnsavedChanges(): boolean {
    return this.signerForm.dirty && !this.isSubmitting();
  }

  /**
   * Load signer data for editing
   */
  private loadSignerData(): void {
    const signerId = this.route.snapshot.paramMap.get('id');

    if (!signerId || isNaN(+signerId)) {
      this.error.set('ID do signatário inválido');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.signersService.getSigner(+signerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (signer) => {
          this.signer.set(signer);
          this.populateForm(signer);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading signer:', error);
          this.error.set('Falhou ao carregar dados do signatário. Tente novamente.');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Populate form with signer data
   */
  private populateForm(signer: Signer): void {
    this.signerForm.patchValue({
      name: signer.name,
      email: signer.email
    });

    // Mark form as pristine after initial population
    this.signerForm.markAsPristine();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.signerForm.value;

    if (this.isEditMode()) {
      this.updateSigner(formValue);
    } else {
      this.createSigner(formValue);
    }
  }

  /**
   * Create new signer
   */
  private createSigner(formValue: any): void {
    const createRequest: CreateSignerRequest = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase()
    };

    this.signersService.createSigner(createRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (signer) => {
          this.notificationService.showSuccess('Signatário criado com sucesso');
          this.signerForm.markAsPristine();
          this.router.navigate(['/signers', signer.id]);
        },
        error: (error) => {
          console.error('Error creating signer:', error);
          this.handleSubmissionError(error);
          this.isSubmitting.set(false);
        }
      });
  }

  /**
   * Update existing signer
   */
  private updateSigner(formValue: any): void {
    const signer = this.signer();
    if (!signer) return;

    const updateRequest: UpdateSignerRequest = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase()
    };

    this.signersService.updateSigner(signer.id, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSigner) => {
          this.notificationService.showSuccess('Signatário atualizado com sucesso');
          this.signer.set(updatedSigner);
          this.signerForm.markAsPristine();
          this.router.navigate(['/signers', updatedSigner.id]);
        },
        error: (error) => {
          console.error('Error updating signer:', error);
          this.handleSubmissionError(error);
          this.isSubmitting.set(false);
        }
      });
  }

  /**
   * Handle submission errors
   */
  private handleSubmissionError(error: any): void {
    if (error.status === 400 && error.error?.message) {
      this.error.set(error.error.message);
    } else if (error.status === 409) {
      this.error.set('A signer with this email already exists');
    } else {
      this.error.set('Falhou ao salvar signatário. Tente novamente.');
    }
  }

  /**
   * Cancel and navigate back
   */
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      );
      if (!confirmed) return;
    }

    this.navigateBack();
  }

  /**
   * Navigate back to appropriate page
   */
  private navigateBack(): void {
    if (this.isEditMode()) {
      const signer = this.signer();
      if (signer) {
        this.router.navigate(['/signers', signer.id]);
      } else {
        this.router.navigate(['/signers']);
      }
    } else {
      this.router.navigate(['/signers']);
    }
  }

  /**
   * Get form control error message
   */
  getFieldError(fieldName: string): string | null {
    const control = this.signerForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return null;

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (errors['email']) {
      return 'Por favor, digite um endereço de email válido';
    }
    if (errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern'] && fieldName === 'name') {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    return 'Entrada inválida';
  }

  /**
   * Get user-friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    switch (fieldName) {
      case 'name':
        return 'Name';
      case 'email':
        return 'Email';
      default:
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    }
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.signerForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }

  /**
   * Get field CSS classes
   */
  getFieldClasses(fieldName: string): string {
    const baseClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6';

    if (this.hasFieldError(fieldName)) {
      return `${baseClasses} ring-red-300 focus:ring-red-600`;
    }

    return `${baseClasses} ring-gray-300 focus:ring-blue-600`;
  }

  /**
   * Reset form to initial state
   */
  onResetForm(): void {
    if (this.isEditMode()) {
      const signer = this.signer();
      if (signer) {
        this.populateForm(signer);
      }
    } else {
      this.signerForm.reset();
    }
    this.error.set(null);
  }
}